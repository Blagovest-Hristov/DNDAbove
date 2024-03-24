<template>
  <div>
    <div v-if="!isRegistered">
      <h2>Login</h2>
      <input type="email" v-model="email" placeholder="Email">
      <input type="password" v-model="password" placeholder="Password">
      <button @click="login">Login</button>
      <p>Don't have an account? <a href="#" @click="toggleForm">Register</a></p>
    </div>

    <div v-else>
      <h2>Register</h2>
      <input type="text" v-model="username" placeholder="Username">
      <input type="email" v-model="email" placeholder="Email">
      <input type="password" v-model="password" placeholder="Password">
      <button @click="register">Register</button>
      <p>Already have an account? <a href="#" @click="toggleForm">Login</a></p>
    </div>
  </div>
</template>

<script>
import { auth, firestore } from './firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


export default {
  data() {
    return {
      isRegistered: false,
      email: '',
      password: '',
      username: ''
    };
  },
  methods: {
    login() {
      signInWithEmailAndPassword(auth, this.email, this.password)
        .then((userCredential) => {
          console.log(userCredential.user);
          this.$router.push('/account');
        })
        .catch((error) => {
          console.error(error);
        });
    },
    register() {
      createUserWithEmailAndPassword(auth, this.email, this.password)
        .then(async (userCredential) => {
          console.log(userCredential.user);
          // Create a document in the 'players' collection
          const userRef = doc(firestore, 'players', userCredential.user.uid);
          await setDoc(userRef, {
            email: this.email,
            userId: userCredential.user.uid,
            username: this.username
          });
          this.$router.push('/account');
        })
        .catch((error) => {
          console.error(error);
        });
    },
    toggleForm() {
      this.isRegistered = !this.isRegistered;
    }
  }
};
</script>

<style scoped>
/* Add your styles here */
</style>
