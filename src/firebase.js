import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBGOzIeQBHZ5i0wM5AzOSpL9v4VjMOMJkw',
  authDomain: 'crm-clinica-88213.firebaseapp.com',
  projectId: 'crm-clinica-88213',
  storageBucket: 'crm-clinica-88213.appspot.com',
  messagingSenderId: '335950500089',
  appId: '1:335950500089:web:3830a63790ce4e851ed228',
  measurementId: "G-NX4RK688SV"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { collection, addDoc, getDocs, query, where };
