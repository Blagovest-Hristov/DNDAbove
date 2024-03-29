import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: "AIzaSyAMorttry94NouZUtgvaZtyZLkVYoxjwhM",
  authDomain: "dndabove-85f76.firebaseapp.com",
  databaseURL: "https://dndabove-85f76-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "dndabove-85f76",
  storageBucket: "dndabove-85f76.appspot.com",
  messagingSenderId: "1086547365704",
  appId: "1:1086547365704:web:8391d1a6f94f2050c3ed7d",
  measurementId: "G-NM5KSD72CZ"
};

const app = initializeApp(firebaseConfig);
console.log(app);
const auth = getAuth(app);
console.log(auth);
const firestore = getFirestore(app);
console.log(firestore);



export { auth, firestore};