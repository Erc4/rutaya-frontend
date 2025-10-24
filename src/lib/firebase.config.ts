// src/lib/firebase.config.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase
// IMPORTANTE: Reemplaza estos valores con los de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDYvnKIx8xbHaIkeg7h4EkE7W53pdkFaWk",
  authDomain: "db-rutaya-14ee3.firebaseapp.com",
  projectId: "db-rutaya-14ee3",
  storageBucket: "db-rutaya-14ee3.firebasestorage.app",
  messagingSenderId: "781388358777",
  appId: "1:781388358777:web:c76be14f2445bdd20e20a8"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar Firestore
export const db = getFirestore(app);