<template>
    <div>
      <h1>My Campaigns</h1>
      <ul v-if="campaigns.length > 0">
        <li v-for="campaign in campaigns" :key="campaign.id">
          <router-link :to="{ name: 'CampaignDMView', params: { campaignId: campaign.id } }">
            <h2>{{ campaign.campaignName }}</h2>
            <p>{{ campaign.description }}</p>
            <p>{{ campaign.location }}</p>
          </router-link>
        </li>
      </ul>
      <p>or</p>
      <h1>Create a new adventure</h1>
      <button @click="showForm">New Campaign</button>
      <div v-if="showCampaignForm">
        <form @submit.prevent="createCampaign">
          <label for="campaignName">Campaign Name:</label>
          <input id="campaignName" v-model="campaignName" required>
  
          <label for="description">Description:</label>
          <textarea id="description" v-model="description"></textarea>
  
          <label for="location">Location:</label>
          <input id="location" v-model="location">
  
          <label for="playerEmails">Player Emails:</label>
          <input id="playerEmails" v-model="playerEmails" placeholder="Enter emails separated by commas">
  
          <button type="submit">Create Campaign</button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { auth, firestore } from './firebase';
  import { collection, query, where, getDocs, addDoc, serverTimestamp, setDoc, doc } from 'firebase/firestore';
  
  export default {
    setup() {
      const campaigns = ref([]);
      const showCampaignForm = ref(false);
      const campaignName = ref('');
      const description = ref('');
      const location = ref('');
      const playerEmails = ref('');
      const router = useRouter();
  
      onMounted(async () => {
        const db = firestore;
        const currentUser = auth.currentUser;
  
        const campaignsCollection = collection(db, 'campaigns');
        const q = query(campaignsCollection, where('dungeonMasterId', '==', currentUser.uid));
  
        try {
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            campaigns.value.push({ id: doc.id, ...doc.data() });
          });
        } catch (error) {
          console.error('Error fetching campaigns:', error);
        }
      });
  
      const showForm = () => {
        showCampaignForm.value = true;
      };
  
      const createCampaign = async () => {
        const db = firestore;
        const currentUser = auth.currentUser;
  
        // Check if a user is signed in
        if (!currentUser) {
          console.error('No user is currently signed in');
          return;
        }
  
        const campaignsCollection = collection(db, 'campaigns');
  
        try {
          // Add the document
          const docRef = await addDoc(campaignsCollection, {
            campaignName: campaignName.value,
            createdTimestamp: serverTimestamp(),
            description: description.value,
            dungeonMasterId: currentUser.uid,
            location: location.value,
            updatedTimestamp: serverTimestamp(),
          });
  
          console.log('Document written with ID: ', docRef.id);
  
          const emails = playerEmails.value.split(',').map(email => email.trim());
  
          // Add each player email to the players subcollection
          for (const email of emails) {
            const playerDocRef = doc(db, 'campaigns', docRef.id, 'players', email);
            await setDoc(playerDocRef, { email });
          }
  
          // Clear the form
          campaignName.value = '';
          description.value = '';
          location.value = '';
          playerEmails.value = '';
  
          // Navigate to the new campaign's page
          router.push({ name: 'CampaignDMView', params: { campaignId: docRef.id } });
        } catch (error) {
          console.error('Error adding document: ', error);
        }
      };
  
      return { campaigns, showCampaignForm, showForm, createCampaign, campaignName, description, location, playerEmails };
    },
  };
  </script>