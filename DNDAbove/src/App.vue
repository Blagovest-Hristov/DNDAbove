<template>
  <div id="app">
    <nav v-if="showNavbar">
      <router-link to="/campaigns">Campaigns</router-link> |
      <router-link to="/account">Profile</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showNavbar: true
    };
  },
  watch: {
    '$route' (to) {
      this.showNavbar = to.name !== 'login'; // compare with the name of the route
    }
  },
  created() {
    this.showNavbar = this.$route.name !== 'login'; // compare with the name of the route
  }
}
</script>


<style >
  body {
    background-color: darkgray;
    color: #e02b2b; /* paler shade of red */
    font-family: 'Roboto', sans-serif; /* Roboto font */
    text-align: center; /* center the text */
  }

  h1, h2 {
    color: #e02b2b; /* paler shade of red */
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin: 20px auto; /* center the list items */
    padding: 20px;
    border: 1px solid #e02b2b; /* paler shade of red */
    border-radius: 5px;
    background-color: #333;
    color: #e02b2b; /* paler shade of red */
    width: 80%; /* adjust as needed */
    max-width: 600px; /* adjust as needed */
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 20px;
  }

  label {
    margin: 10px 0;
    color: #e02b2b; /* paler shade of red */
  }

  input, textarea {
    width: 100%;
    padding: 10px;
    border: 1px solid #e02b2b; /* paler shade of red */
    border-radius: 5px;
    background-color: #333;
    color: #e02b2b; /* paler shade of red */
  }

  button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #e02b2b; /* paler shade of red */
    color: darkgray;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  button:hover {
    background-color: #ff4d4d; /* darker shade of red */
  }
</style>
