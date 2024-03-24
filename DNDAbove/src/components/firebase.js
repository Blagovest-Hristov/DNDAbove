import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
    apiKey: "AIzaSyAMorttry94NouZUtgvaZtyZLkVYoxjwhM",
    authDomain: "dndabove-85f76.firebaseapp.com",
    projectId: "dndabove-85f76",
  };

const app = initializeApp(firebaseConfig);
console.log(app);
const auth = getAuth(app);
console.log(auth);
const firestore = getFirestore(app);
console.log(firestore);



export { auth, firestore};