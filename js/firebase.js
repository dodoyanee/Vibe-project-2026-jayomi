import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import { connectFirestoreEmulator, getFirestore } from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBSOd1h3E3NUhdPA_RjDWcYNWdE3l8IOdw',
  authDomain: 'jayomi-web-project.firebaseapp.com',
  projectId: 'jayomi-web-project',
  storageBucket: 'jayomi-web-project.firebasestorage.app',
  messagingSenderId: '682059995568',
  appId: '1:682059995568:web:a6fde8958c03725c205e75',
  measurementId: 'G-RXYLK5X6W1',
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);

const USE_FIRESTORE_EMULATOR = false;

if (USE_FIRESTORE_EMULATOR && location.hostname === 'localhost') {
  connectFirestoreEmulator(firestore, '127.0.0.1', 8080);
}
