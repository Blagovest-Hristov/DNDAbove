import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/LogInPage.vue'
import Campaigns from './components/CampaignsPage.vue'
import Account from './components/AccountPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login, name: 'login'},
    { path: '/campaigns', component: Campaigns, name: 'campaigns'},
    { path: '/account', component: Account, name: 'account'},
    { path: '/', redirect: '/login' },
    // other routes...
  ],
})

createApp(App).use(router).mount('#app')

  
  