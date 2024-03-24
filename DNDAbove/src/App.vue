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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>