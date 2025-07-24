import { initializeApp } from "firebase/app";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    query,
    orderBy
} from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export class FirebaseClient {
    private static inventoryRef = collection(db, "inventory");

    // CREATE
    static async addItem(item: { count: number; name: string; price: string }) {
        const docRef = await addDoc(this.inventoryRef, {
            ...item,
            timestamp: Timestamp.now()
        });
        return docRef.id;
    }

    // READ ALL
    static async getAllItems() {
        const q = query(this.inventoryRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }

    // READ SINGLE
    static async getItemById(id: string) {
        const docRef = doc(db, "inventory", id);
        const snapshot = await getDoc(docRef);
        if (!snapshot.exists()) {
            throw new Error("Item not found");
        }
        return { id: snapshot.id, ...snapshot.data() };
    }

    // UPDATE
    static async updateItem(id: string, updatedData: Partial<{ count: number; name: string; price: string }>) {
        const docRef = doc(db, "inventory", id);
        await updateDoc(docRef, {
            ...updatedData
        });
    }

    // DELETE
    static async deleteItem(id: string) {
        const docRef = doc(db, "inventory", id);
        await deleteDoc(docRef);
    }
}
