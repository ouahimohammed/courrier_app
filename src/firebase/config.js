import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCWVrDtNQBmYsCWqmioZd_2KpPK8ndxzMw",
  authDomain: "courrier-hadboumoussa.firebaseapp.com",
  projectId: "courrier-hadboumoussa",
  storageBucket: "courrier-hadboumoussa.firebasestorage.app",
  messagingSenderId: "14714284104",
  appId: "1:14714284104:web:771312ed5d71b90cdc907d",
  measurementId: "G-58TGG0QNK4"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
