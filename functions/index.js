const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getMessaging } = require("firebase-admin/messaging");

// Initialize Firebase Admin
initializeApp();

const db = getFirestore();
const messaging = getMessaging();

/**
 * Send push notification to a user
 */
async function sendPushNotification(fcmToken, title, body, data = {}) {
    if (!fcmToken) {
        console.log("No FCM token provided");
        return null;
    }

    const message = {
        notification: {
            title,
            body,
        },
        data: {
            ...data,
            click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        token: fcmToken,
    };

    try {
        const response = await messaging.send(message);
        console.log("Successfully sent message:", response);
        return response;
    } catch (error) {
        console.error("Error sending message:", error);
        // If token is invalid, we might want to clean it up
        if (error.code === "messaging/invalid-registration-token" ||
            error.code === "messaging/registration-token-not-registered") {
            console.log("Invalid token, should be cleaned up");
        }
        return null;
    }
}

/**
 * Get user's FCM token from Firestore
 */
async function getUserFCMToken(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists) {
            return userDoc.data().fcmToken || null;
        }
        return null;
    } catch (error) {
        console.error("Error getting user FCM token:", error);
        return null;
    }
}

/**
 * Get user by email
 */
async function getUserByEmail(email) {
    try {
        const usersSnapshot = await db.collection("users")
            .where("email", "==", email.toLowerCase())
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
            const userDoc = usersSnapshot.docs[0];
            return { id: userDoc.id, ...userDoc.data() };
        }
        return null;
    } catch (error) {
        console.error("Error getting user by email:", error);
        return null;
    }
}

/**
 * Get partner user data
 */
async function getPartnerData(userId) {
    try {
        const userDoc = await db.collection("users").doc(userId).get();
        if (userDoc.exists && userDoc.data().partnerEmail) {
            const partner = await getUserByEmail(userDoc.data().partnerEmail);
            return partner;
        }
        return null;
    } catch (error) {
        console.error("Error getting partner data:", error);
        return null;
    }
}

// ============================================
// TRIGGER: New Wish Created
// ============================================
exports.onWishCreated = onDocumentCreated("wishes/{wishId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const wish = snapshot.data();
    const wishId = event.params.wishId;

    console.log("New wish created:", wishId, wish.title);

    // Don't notify for private wishes
    if (wish.visibility === "private") {
        console.log("Private wish, no notification sent");
        return;
    }

    // Don't notify for surprise wishes (until reveal date)
    if (wish.visibility === "surprise" && wish.revealDate) {
        const revealDate = new Date(wish.revealDate);
        if (revealDate > new Date()) {
            console.log("Surprise wish, notification will be sent on reveal date");
            return;
        }
    }

    // Get the creator's partner
    const partner = await getPartnerData(wish.createdBy);
    if (!partner || !partner.fcmToken) {
        console.log("Partner not found or has no FCM token");
        return;
    }

    // Send notification to partner
    const title = "Yeni Bir Hayal! ✨";
    const body = `Partneriniz yeni bir hedef ekledi: "${wish.title}"`;

    await sendPushNotification(partner.fcmToken, title, body, {
        type: "new_wish",
        wishId: wishId,
    });

    console.log("Notification sent to partner for new wish");
});

// ============================================
// TRIGGER: Wish Completed
// ============================================
exports.onWishCompleted = onDocumentUpdated("wishes/{wishId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();
    const wishId = event.params.wishId;

    // Check if wish was just completed
    if (!before.completed && after.completed) {
        console.log("Wish completed:", wishId, after.title);

        // Get the creator's partner
        const partner = await getPartnerData(after.createdBy);
        if (!partner || !partner.fcmToken) {
            console.log("Partner not found or has no FCM token");
            return;
        }

        const title = "Bir Hayal Gerçekleşti! 🎉";
        const body = `"${after.title}" hedefi tamamlandı!`;

        await sendPushNotification(partner.fcmToken, title, body, {
            type: "wish_completed",
            wishId: wishId,
        });

        console.log("Notification sent for completed wish");
    }
});

// ============================================
// TRIGGER: Time Capsule Created
// ============================================
exports.onCapsuleCreated = onDocumentCreated("capsules/{capsuleId}", async (event) => {
    const snapshot = event.data;
    if (!snapshot) return;

    const capsule = snapshot.data();
    const capsuleId = event.params.capsuleId;

    console.log("New capsule created:", capsuleId);

    // If the capsule is for someone else (not self)
    if (capsule.receiverEmail && capsule.receiverEmail !== "self") {
        const receiver = await getUserByEmail(capsule.receiverEmail);
        if (receiver && receiver.fcmToken) {
            const title = "Geleceğe Bir Mektup! 💌";
            const unlockDate = new Date(capsule.unlockDate).toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric"
            });
            const body = `Sana bir zaman kapsülü gönderildi. ${unlockDate} tarihinde açılacak!`;

            await sendPushNotification(receiver.fcmToken, title, body, {
                type: "new_capsule",
                capsuleId: capsuleId,
            });

            console.log("Notification sent to capsule receiver");
        }
    }
});

// ============================================
// SCHEDULED: Check for approaching target dates
// Runs every day at 9:00 AM
// ============================================
exports.dailyReminderCheck = onSchedule("0 9 * * *", async (event) => {
    console.log("Running daily reminder check...");

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    try {
        // Get all wishes with target dates in the next 3 days
        const wishesSnapshot = await db.collection("wishes")
            .where("completed", "==", false)
            .get();

        const notifications = [];

        for (const doc of wishesSnapshot.docs) {
            const wish = doc.data();
            if (!wish.targetDate) continue;

            const targetDate = new Date(wish.targetDate);
            const diffTime = targetDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // Notify if target date is tomorrow or in 3 days
            if (diffDays === 1 || diffDays === 3) {
                const fcmToken = await getUserFCMToken(wish.createdBy);
                if (fcmToken) {
                    const title = diffDays === 1
                        ? "Hedefin Yarın! ⏰"
                        : "Hedefe 3 Gün Kaldı! 📅";
                    const body = `"${wish.title}" hedefinin tarihi yaklaşıyor!`;

                    notifications.push(
                        sendPushNotification(fcmToken, title, body, {
                            type: "reminder",
                            wishId: doc.id,
                            daysLeft: diffDays.toString(),
                        })
                    );
                }
            }
        }

        await Promise.all(notifications);
        console.log(`Sent ${notifications.length} reminder notifications`);

    } catch (error) {
        console.error("Error in daily reminder check:", error);
    }
});

// ============================================
// SCHEDULED: Check for capsules to unlock
// Runs every hour
// ============================================
exports.checkCapsuleUnlocks = onSchedule("0 * * * *", async (event) => {
    console.log("Checking for capsules to unlock...");

    const now = new Date();

    try {
        const capsulesSnapshot = await db.collection("capsules")
            .where("notified", "!=", true)
            .get();

        for (const doc of capsulesSnapshot.docs) {
            const capsule = doc.data();
            const unlockDate = new Date(capsule.unlockDate);

            if (unlockDate <= now) {
                // Capsule is now unlocked!
                const receiver = await getUserByEmail(capsule.receiverEmail);
                if (receiver && receiver.fcmToken) {
                    const title = "Zaman Kapsülü Açıldı! 🎁";
                    const body = `"${capsule.title}" kapsülünün mührü açıldı! Okumak için tıklayın.`;

                    await sendPushNotification(receiver.fcmToken, title, body, {
                        type: "capsule_unlocked",
                        capsuleId: doc.id,
                    });

                    // Mark as notified
                    await doc.ref.update({ notified: true });
                    console.log("Capsule unlock notification sent:", doc.id);
                }
            }
        }
    } catch (error) {
        console.error("Error checking capsule unlocks:", error);
    }
});

// ============================================
// SCHEDULED: Check for surprise reveals
// Runs every hour
// ============================================
exports.checkSurpriseReveals = onSchedule("0 * * * *", async (event) => {
    console.log("Checking for surprise reveals...");

    const now = new Date();

    try {
        const wishesSnapshot = await db.collection("wishes")
            .where("visibility", "==", "surprise")
            .where("surpriseNotified", "!=", true)
            .get();

        for (const doc of wishesSnapshot.docs) {
            const wish = doc.data();
            if (!wish.revealDate) continue;

            const revealDate = new Date(wish.revealDate);

            if (revealDate <= now) {
                // Surprise is now revealed!
                const partner = await getPartnerData(wish.createdBy);
                if (partner && partner.fcmToken) {
                    const title = "Sürpriz Açıldı! 🎁";
                    const body = `Partnerinizin bir sürpriz hayali vardı: "${wish.title}"`;

                    await sendPushNotification(partner.fcmToken, title, body, {
                        type: "surprise_revealed",
                        wishId: doc.id,
                    });

                    // Mark as notified
                    await doc.ref.update({ surpriseNotified: true });
                    console.log("Surprise reveal notification sent:", doc.id);
                }
            }
        }
    } catch (error) {
        console.error("Error checking surprise reveals:", error);
    }
});
