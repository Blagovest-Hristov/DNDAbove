<template>
  <div>
    <h1>{{ campaign.campaignName }}</h1>
    <p>{{ campaign.description }}</p>

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
      <option v-for="monster in monsters" :key="monster.index" :value="monster.url">
        {{ monster.name }}
      </option>
    </select>
    <button @click="addMonster">Add Monster</button>

    <h2>Items</h2>
    <select v-model="selectedItem">
      <option v-for="item in items" :key="item.index" :value="item.url">
        {{ item.name }}
      </option>
    </select>
    <button @click="addItem">Add Item</button>

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
import { collection, doc, getDocs, addDoc } from 'firebase/firestore';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://www.dnd5eapi.co/api/'
});

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
    const campaignDoc = getDocs(campaignDocRef);

    onMounted(async () => {

      campaign.value = campaignDoc.data();

      // Fetch the player references from the campaign document
      const playerRefs = campaign.value.players;
      for (const playerRef of playerRefs) {
        const playerDoc = await getDocs(playerRef);
        players.value.push(playerDoc.data());
      }

      // Fetch data from the D&D 5e API
      const monsterResponse = await axiosInstance.get('monsters');
      monsters.value = monsterResponse.data.results;
      const itemResponse = await axiosInstance.get('equipment');
      items.value = itemResponse.data.results;
    });

    const addPlayer = async () => {
      const playersCollectionRef = collection(campaignDocRef, 'players');
      await addDoc(playersCollectionRef, { email: newPlayerEmail.value });
      newPlayerEmail.value = '';
    };

    const addMonster = async () => {
      const monstersCollectionRef = collection(campaignDocRef, 'monsters');
      const monsterResponse = await axiosInstance.get(selectedMonster.value);
      await addDoc(monstersCollectionRef, monsterResponse.data);
      selectedMonster.value = null;
    };

    const addItem = async () => {
      const itemsCollectionRef = collection(campaignDocRef, 'items');
      const itemResponse = await axiosInstance.get(selectedItem.value);
      await addDoc(itemsCollectionRef, itemResponse.data);
      selectedItem.value = null;
    };

    return { campaign, players, monsters, characters, items, newPlayerEmail, selectedMonster, selectedItem, addPlayer, addMonster, addItem };
  },
};
</script>

<style scoped>
/* your styles */
</style>