import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDohK_oyIK6l3zWDq8fnqPPG8mu_p8Y-mc",
    authDomain: "project-3402036684893689390.firebaseapp.com",
    projectId: "project-3402036684893689390",
    storageBucket: "project-3402036684893689390.firebasestorage.app",
    messagingSenderId: "735385506042",
    appId: "1:735385506042:web:e1cb05eef316cdebe2f943"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
