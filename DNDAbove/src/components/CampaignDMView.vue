<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h1 v-if="campaign">{{ campaign.campaignName }}</h1>
    </div>
    <h2>Players</h2>
    <input v-model="newPlayerEmail" placeholder="Enter player email">
    <button @click="addPlayer">Add Player</button>
    <ul>
      <li v-for="player in players" :key="player.id">
        {{ player.username }}
      </li>
    </ul>

    <h2>Monsters</h2>
    <select v-model="selectedMonster">
      <option v-for="monster in monsters" :key="monster.index" :value="monster">
        {{ monster.name }}
      </option>
    </select>
    <button @click="addMonsterToCampaign">Add Monster</button>

    <h2>Items</h2>
    <select v-model="selectedItem">
      <option v-for="item in items" :key="item.index" :value="item">
        {{ item.name }}
      </option>
    </select>
    <button @click="addItemToCampaign">Add Item</button>

    <h2>Characters</h2>
    <ul>
      <li v-for="character in characters" :key="character.id">
        {{ character.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { firestore } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, query, where } from 'firebase/firestore';

export default {
  props: ['campaignId'],
  setup(props) {
    const campaign = ref(null);
    const players = ref([]);
    const monsters = ref([]);
    const characters = ref([]);
    const items = ref([]);
    const newPlayerEmail = ref('');
    const selectedMonster = ref(null);
    const selectedItem = ref(null);

    const db = firestore;
    const campaignDocRef = doc(db, 'campaigns', props.campaignId);

    onMounted(async () => {
      // Fetch monsters
      const monstersResponse = await fetch('https://www.dnd5eapi.co/api/monsters');
      const monstersData = await monstersResponse.json();
      monsters.value = monstersData.results;

      // Fetch items
      const itemsResponse = await fetch('https://www.dnd5eapi.co/api/equipment');
      const itemsData = await itemsResponse.json();
      items.value = itemsData.results;

      const campaignDocSnap = await getDoc(campaignDocRef);

      if (campaignDocSnap.exists()) {
        campaign.value = { id: campaignDocSnap.id, ...campaignDocSnap.data() };

        const playersCollectionRef = collection(db, 'campaigns', props.campaignId, 'players');
        const playersQuerySnapshot = await getDocs(playersCollectionRef);
        for (let docSnapshot of playersQuerySnapshot.docs) {
          const playerDocRef = docSnapshot.data().ref;
          const playerDocSnap = await getDoc(playerDocRef);
          if (playerDocSnap.exists()) {
            players.value.push({ id: playerDocSnap.id, username: playerDocSnap.data().username });
          }
        }
      } else {
        console.log('No such document!');
      }
    });

    const addPlayer = async () => {
      if (newPlayerEmail.value) { // check if newPlayerEmail.value is not empty
        const usersCollectionRef = collection(db, 'players');
        const q = query(usersCollectionRef, where('email', '==', newPlayerEmail.value));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDocSnap = querySnapshot.docs[0];
          const playerData = { ref: userDocSnap.ref }; // store the reference to the document
          const playersCollectionRef = collection(db, 'campaigns', props.campaignId, 'players');
          await addDoc(playersCollectionRef, playerData);
          players.value.push({ id: userDocSnap.id, username: userDocSnap.data().username });
        }
        else {
          console.log('No such document in players collection!');
        }
        newPlayerEmail.value = '';
      }
    };

    const addMonsterToCampaign = async () => {
      const monstersCollectionRef = collection(campaignDocRef, 'monsters');
      await addDoc(monstersCollectionRef, selectedMonster.value);
    };

    const addItemToCampaign = async () => {
      const itemsCollectionRef = collection(campaignDocRef, 'items');
      await addDoc(itemsCollectionRef, selectedItem.value);
    };

    return { campaign, players, monsters, characters, items, newPlayerEmail, selectedMonster, selectedItem, addPlayer, addMonsterToCampaign, addItemToCampaign };
  },
};
</script>

<style scoped>
/* your styles */
</style>