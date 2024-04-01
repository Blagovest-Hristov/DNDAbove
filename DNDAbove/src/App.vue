<template>
  <div id="app">
    <nav v-if="showNavbar" class="navbar">
      <router-link class="nav-link" to="/campaigns">Campaigns</router-link> |
      <router-link class="nav-link" to="/account">Profile</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
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


<style>
body {
  background-color: darkgray;
  font-family: 'Roboto', sans-serif; /* Roboto font */
}

.navbar {
  background-color: #333;
  padding: 10px;
  color: white;
}

.nav-link {
  color: white;
  text-decoration: none;
  margin: 0 10px;
}

.nav-link:hover {
  color: #e02b2b; /* A shade of red for hover effect */
}

button {
  background-color: #e02b2b; /* A shade of red for button color */
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
}

button:hover {
  background-color: darkred; /* Darker shade of red for button hover color */
}

.list-group-item {
  background-color: #333; /* Dark gray background color */
  color: white; /* White text color */
  border: none; /* Remove border */
}

router-link-exact-active,
router-link-active {
  text-decoration: none;
  color: inherit;
}


</style>