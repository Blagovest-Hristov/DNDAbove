<template>
  <div id="app">
    <nav v-if="showNavbar" class="navbar">
      <router-link class="nav-link" to="/campaigns">Campaigns</router-link> |
      <router-link class="nav-link" to="/account">Profile</router-link>
    </nav>
    <div class="content">
      <router-view />
    </div>
    <footer class="footer">
      <p>&copy; 2024 Your Company | Licensed under MIT License</p>
    </footer>
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
    '$route'(to) {
      this.showNavbar = to.name !== 'login';
    }
  },
  created() {
    this.showNavbar = this.$route.name !== 'login';

    // Example: Show error notification
    this.$toast.error('Error');
  }
}
</script>
<style>
/* Global Styles */
@font-face {
  font-family: myFont;
  src: url(./assets/Heroarcherfreeversion-Regular.ttf);
}

body {
  background-color: #f5f5f5; /* Light gray background */
  font-family: 'myFont', sans-serif; /* Custom font family */
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* Ensure full viewport height */
  margin: 0;
}

#app {
  flex: 1; /* Allow app container to grow */
  display: flex;
  flex-direction: column;
}

.navbar {
  background-color: #333;
  color: white;
  padding: 10px;
  text-align: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  margin: 0 10px;
}

.nav-link:hover {
  color: #e02b2b; /* Red color on hover */
}

.content {
  flex: 1; /* Allow content to grow and fill remaining space */
  padding: 20px; /* Add padding for content area */
}

footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 10px;
}

/* Button Styles */
button {
  background-color: #e02b2b;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #c80000; /* Darker red on hover */
}

/* Ensure footer stays at bottom */
html {
  position: relative;
  min-height: 100%;
}

body {
  margin-bottom: 60px; /* Height of the footer */
}

footer {
  position: absolute;
  bottom: 0;
  width: 100%;
}

/* Page-specific styles can be added here */
</style>
