import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyAMorttry94NouZUtgvaZtyZLkVYoxjwhM",
    authDomain: "dndabove-85f76.firebaseapp.com",
    projectId: "dndabove-85f76npm",
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);


export { auth, firestore};