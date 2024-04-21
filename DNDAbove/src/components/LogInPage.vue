<template>
  <div>
  <div class="d-flex justify-content-center align-items-center" style="min-height: 100vh;">
    <div class="container">

      <div v-if="!isRegistered" class="text-center">
        <img class="imageDice" src="../assets/6545894.png" alt="">

        <h2>Login</h2>
        <input type="email" v-model="email" class="form-control" placeholder="Email">
        <input type="password" v-model="password" class="form-control" placeholder="Password">
        <button @click="login" class="btn btn-primary mt-3">Login</button>
        <p class="mt-3">Don't have an account? <a href="#" @click="toggleForm">Register</a></p>
      </div>

      <div v-else class="text-center">
        <h2>Register</h2>
        <input type="text" v-model="username" class="form-control" placeholder="Username">
        <input type="email" v-model="email" class="form-control" placeholder="Email">
        <input type="password" v-model="password" class="form-control" placeholder="Password">
        <button @click="register" class="btn btn-primary mt-3">Register</button>
        <p class="mt-3">Already have an account? <a href="#" @click="toggleForm">Login</a></p>
      </div>
    </div>
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

.imageDice{
height: 3rem;
width: 3rem;
}

</style>
