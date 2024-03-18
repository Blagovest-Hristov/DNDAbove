import App from './App.vue'
import Dashboard from './components/Dashboard.vue'
import Campaigns from './Campaigns.vue'
import Login from './Login.vue'  // import the Login component



Vue.use(VueRouter)

const routes = [
  { path: '/#app', component: Dashboard },
  { path: '/', component: Login },  
  { path: '/campaigns', component: Campaigns }


]

const router = new VueRouter({
  routes // short for `routes: routes`
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')