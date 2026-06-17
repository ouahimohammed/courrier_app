import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Configuration Firebase (à mettre dans un fichier .env plus tard)
const firebaseConfig = {
  apiKey: "AIzaSyCWVrDtNQBmYsCWqmioZd_2KpPK8ndxzMw",
  authDomain: "courrier-hadboumoussa.firebaseapp.com",
  projectId: "courrier-hadboumoussa",
  storageBucket: "courrier-hadboumoussa.firebasestorage.app",
  messagingSenderId: "14714284104",
  appId: "1:14714284104:web:771312ed5d71b90cdc907d",
  measurementId: "G-58TGG0QNK4"
};

// Initialiser Firebase pour l'authentification
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- EXPORTS ---

// Connexion avec email et mot de passe
export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun utilisateur trouvé avec cet email';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Mot de passe incorrect';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Trop de tentatives. Réessayez plus tard';
    }
    return { success: false, error: errorMessage };
  }
};

// Inscription avec email et mot de passe
export const registerWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    return { success: true, user: userCredential.user };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Cet email est déjà utilisé';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Le mot de passe doit contenir au moins 6 caractères';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    }
    return { success: false, error: errorMessage };
  }
};

// Connexion avec Google
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/popup-closed-by-user') {
      errorMessage = 'Fenêtre de connexion fermée';
    } else if (error.code === 'auth/cancelled-popup-request') {
      errorMessage = 'Connexion annulée';
    }
    return { success: false, error: errorMessage };
  }
};

// Déconnexion
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Réinitialisation du mot de passe
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    let errorMessage = error.message;
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'Aucun utilisateur trouvé avec cet email';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email invalide';
    }
    return { success: false, error: errorMessage };
  }
};

// Observer l'état de l'authentification
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Exporter l'instance auth pour une utilisation directe
export { auth };