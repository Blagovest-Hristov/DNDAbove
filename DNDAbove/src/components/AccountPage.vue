<template>
    <div>
        <h1>Account Page</h1>
        <div v-if="user">
            <p>Username: {{ user.username }}</p>
            <p>Email: {{ user.email }}</p>
        </div>
        <div v-else>
            <p>Loading user data...</p>
        </div>
    </div>
</template>

<script>
import { auth, firestore } from './firebase'; 
import { doc, getDoc, collection } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default {
  data() {
    return {
      user: null
    };
  },
  async mounted() {
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(collection(firestore, 'players'), currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          this.user = docSnap.data();
          console.log("success", this.user);
        }
      }
    });
  }
};
</script>