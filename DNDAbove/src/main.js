import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import Login from './components/LogInPage.vue'
import Campaigns from './components/CampaignsPage.vue'
import Account from './components/AccountPage.vue'
import CampaignDMView from './components/CampaignDMView.vue';
import CampaignPlayerView from './components/CampaignPlayerView.vue'; // Import the component
import CharacterView from './components/CharacterView.vue'; // Import the component
import 'bootstrap/dist/css/bootstrap.css'



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
    {
      path: '/campaign/:campaignId', // :campaignId is a dynamic segment
      name: 'CampaignPlayerView',
      component: CampaignPlayerView,
      props: true // This will pass route.params to your component as props
    },
    {
      path: '/campaign/:campaignId/character/:characterId',
      name: 'CharacterView',
      component: CharacterView,
      props: true
  }

  ],
})


createApp(App).use(router).mount('#app')

  
  