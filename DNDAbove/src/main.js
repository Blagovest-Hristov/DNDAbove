import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/LogInPage.vue'
import Campaigns from './components/CampaignsPage.vue'
import Account from './components/AccountPage.vue'
import CampaignDMView from './components/CampaignDMView.vue';


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    { path: '/login', component: Login, name: 'login'},
    { path: '/campaigns', component: Campaigns, name: 'campaigns'},
    { path: '/account', component: Account, name: 'account'},
    { path: '/', redirect: '/login' },
    {
      path: '/campaign/:campaignId',
      name: 'CampaignDMView',
      component: CampaignDMView,
      props: true
    },
    // other routes...
  ],
})


createApp(App).use(router).mount('#app')

  
  