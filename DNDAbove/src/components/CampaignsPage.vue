<template>
    <div>
        <h1>My Campaigns</h1>
        <ul v-if="campaigns.length > 0">
            <li v-for="campaign in campaigns" :key="campaign.id">
                {{ campaign.name }}
            </li>
        </ul>
        <p v-else>Create a new adventure</p>
        <button v-if="campaigns.length === 0" @click="showForm">New Campaign</button>
        <form v-if="showCampaignForm" @submit="createCampaign">
            <!-- Add form fields for campaign details -->
        </form>
        <div v-if="showCampaignForm">
            <form @submit.prevent="createCampaign">
              <label for="campaignName">Campaign Name:</label>
              <input id="campaignName" v-model="campaignName" required>
      
              <label for="description">Description:</label>
              <textarea id="description" v-model="description"></textarea>
      
              <label for="location">Location:</label>
              <input id="location" v-model="location">
      
              <button type="submit">Create Campaign</button>
            </form>
          </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { auth, firestore } from './firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

export default {
  setup() {
    const campaigns = ref([]);
    const showCampaignForm = ref(false);
    const campaignName = ref('');
    const description = ref('');
    const location = ref('');

    onMounted(async () => {
      const db = firestore;
      const currentUser = auth.currentUser;

      const campaignsCollection = collection(db, 'campaigns');
      const q = query(campaignsCollection, where('dungeonMasterId', '==', currentUser.uid));

      try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          campaigns.value.push(doc.data());
        });
      } catch (error) {
        console.error('Error fetching campaigns:', error);
      }
    });

    const createCampaign = async () => {
      const db = firestore;
      const currentUser = auth.currentUser;

      const campaignsCollection = collection(db, 'campaigns');

      try {
        const docRef = await addDoc(campaignsCollection, {
          campaignId: '', // replace with the actual campaignId
          campaignName: campaignName.value,
          createdTimestamp: serverTimestamp(),
          description: description.value,
          dungeonMasterId: currentUser.uid,
          location: location.value,
          updatedTimestamp: serverTimestamp(),
        });

        console.log('Document written with ID: ', docRef.id);

        // Clear the form
        campaignName.value = '';
        description.value = '';
        location.value = '';
      } catch (error) {
        console.error('Error adding document: ', error);
      }
    };

    return { campaigns, showCampaignForm, createCampaign, campaignName, description, location };
  },
};
</script>