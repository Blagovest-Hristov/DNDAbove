<template>
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-md-6 text-center">
        <h1>Account Page</h1>

        <div v-if="user">
          <h3>Username: {{ user.username }}</h3>
          <h3>Email: {{ user.email }}</h3>

          <!-- Button to toggle username change form -->
          <button @click="toggleUsernameForm">{{ showUsernameForm ? 'Hide' : 'Change Username' }}</button>

          <!-- Username change form -->
          <form v-if="showUsernameForm" @submit.prevent="changeUsername">
            <label for="newUsername">New Username:</label>
            <input type="text" id="newUsername" v-model="newUsername" required>
            <button type="submit">Save</button>
          </form>

          <button @click="logout">Logout</button>


          <!-- Show a message when username is updated -->
          <p v-if="changeSuccess">Username updated successfully!</p>
        </div>

        <div v-else>
          <p>Loading user data...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, firestore } from './firebase'; 
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';


export default {
  data() {
    return {
      user: null,
      newUsername: '',
      changeSuccess: false,
      showUsernameForm: false 
    };
  },
  async mounted() {
    const router = useRouter();

    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(firestore, 'players', currentUser.uid); 
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          this.user = docSnap.data();
        }
      }
      else {
        router.push('/login');

      }
    });
  },
  methods: {
    toggleUsernameForm() {
      this.showUsernameForm = !this.showUsernameForm; 
      this.newUsername = ''; 
    },
    async changeUsername() {
      if (this.newUsername.trim() !== '') {
        const userRef = doc(firestore, 'players', this.user.userId); 
        try {
          await updateDoc(userRef, {
            username: this.newUsername.trim()
          });
          this.user.username = this.newUsername.trim();
          this.changeSuccess = true;
          this.showUsernameForm = false;
          this.newUsername = '';
          setTimeout(() => {
            this.changeSuccess = false;
          }, 3000);
        } catch (error) {
          console.error('Error updating username:', error);
        }
      }
    },
    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error) {
        console.error('Error signing out: ', error);
      }
    },
  }
};
</script>
