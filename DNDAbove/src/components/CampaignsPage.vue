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
    </div>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/firestore';

export default {
    name: 'CampaignsPage',
    data() {
        return {
            campaigns: [],
            showCampaignForm: false,
        };
    },
    mounted() {
        // Assuming you have already initialized Firebase in your project
        const db = firebase.firestore();
        const currentUser = firebase.auth().currentUser;

        // Fetch campaigns with the same dungeonMasterId as the current user
        db.collection('campaigns')
            .where('dungeonMasterId', '==', currentUser.uid)
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    this.campaigns.push(doc.data());
                });
            })
            .catch((error) => {
                console.error('Error fetching campaigns:', error);
            });
    },
    methods: {
        showForm() {
            this.showCampaignForm = true;
        },
        createCampaign() {
            // Implement the logic to create a new campaign in the database
        },
    },
};
</script>