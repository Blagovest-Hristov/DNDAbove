<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <h1 class="text-center">My Campaigns</h1>

        <ul v-if="campaigns.length > 0" class="list-group">
          <li class="list-group-item" v-for="campaign in campaigns" :key="campaign.id">
            <router-link :to="{ name: 'CampaignDMView', params: { campaignId: campaign.id } }">
              <h2>{{ campaign.campaignName }}</h2>
              <p>{{ campaign.description }}</p>
              <p>{{ campaign.location }}</p>
            </router-link>
          </li>
        </ul>

        <h1 class="text-center mt-4">Player Campaigns</h1>

        <ul v-if="playerCampaigns.length > 0" class="list-group">
          <li class="list-group-item" v-for="campaign in playerCampaigns" :key="campaign.id">
            <router-link :to="{ name: 'CampaignPlayerView', params: { campaignId: campaign.id } }">
              <h2>{{ campaign.campaignName }}</h2>
              <p>{{ campaign.description }}</p>
              <p>{{ campaign.location }}</p>
            </router-link>
          </li>
        </ul>

        <div class="text-center mt-4">
          <h1>Create a new adventure</h1>
          <button @click="showForm" class="btn btn-primary">New Campaign</button>
        </div>

        <div v-if="showCampaignForm" class="mt-4">
          <form @submit.prevent="createCampaign">
            <div class="form-group">
              <label for="campaignName">Campaign Name:</label>
              <input id="campaignName" v-model="campaignName" class="form-control" required>
            </div>

            <div class="form-group">
              <label for="description">Description:</label>
              <textarea id="description" v-model="description" class="form-control"></textarea>
            </div>

            <div class="form-group">
              <label for="location">Location:</label>
              <input id="location" v-model="location" class="form-control">
            </div>

            <div class="form-group">
              <label for="playerEmails">Player Emails:</label>
              <input id="playerEmails" v-model="playerEmails" class="form-control" placeholder="Enter emails separated by commas">
            </div>

            <button type="submit" class="btn btn-success">Create Campaign</button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, firestore } from './firebase';
import { collection, getDocs, addDoc, serverTimestamp, setDoc, doc, getDoc, query, where } from 'firebase/firestore';

export default {
  setup() {
    const campaigns = ref([]);
    const playerCampaigns = ref([]);
    const showCampaignForm = ref(false);
    const campaignName = ref('');
    const description = ref('');
    const location = ref('');
    const playerEmails = ref('');
    const router = useRouter();

    let unsubscribe;

    onMounted(async () => {
      unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const db = firestore;
          const campaignsDMCollection = collection(db, 'campaigns');
          const q = query(campaignsDMCollection, where('dungeonMasterId', '==', user.uid));

          try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
              campaigns.value.push({ id: doc.id, ...doc.data() });
            });
          } catch (error) {
            console.error('Error fetching campaigns:', error);
          }

          const campaignsCollection = collection(db, 'campaigns');
          const campaignDocs = await getDocs(campaignsCollection);

          for (const campaignDoc of campaignDocs.docs) {
            const playersCollectionRef = collection(db, 'campaigns', campaignDoc.id, 'players');
            const playersQuerySnapshot = await getDocs(playersCollectionRef);

            for (let docSnapshot of playersQuerySnapshot.docs) {
              const playerRef = docSnapshot.data().ref; // Get the player's Firestore reference

              if (playerRef) {
                const playerDocSnap = await getDoc(playerRef);

                if (playerDocSnap.exists() && playerDocSnap.id === user.uid) {
                  playerCampaigns.value.push({ id: campaignDoc.id, ...campaignDoc.data() });
                  break; // Exit the inner loop as soon as the current user is found
                }
              }
            }
          }
        } else {
          console.log('No user is currently signed in');
        }
      });
    });

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe();
      }
    });

    const showForm = () => {
      showCampaignForm.value = true;
    };

    const createCampaign = async () => {
      const db = firestore;
      const user = auth.currentUser;

      if (!user) {
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
          dungeonMasterId: user.uid,
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

    return { campaigns, playerCampaigns, showCampaignForm, showForm, createCampaign, campaignName, description, location, playerEmails };
  },
};
</script>
<style scoped>
a {
  color: #e02b2b; /* Set link color to dark gray (#333) */
  text-decoration: none; /* Remove underline from links */
}

/* Style for links when hovered */
a:hover {
  color: darkred; /* Change link color on hover to Bootstrap's primary color (#007bff) */
  text-decoration: none; /* Remove underline on hover */
}
</style>