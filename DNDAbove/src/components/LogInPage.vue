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
import { auth } from './firebase'; // replace '@/firebase' with the path to your firebase.js file
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

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
        .then((userCredential) => {
          console.log(userCredential.user);
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
