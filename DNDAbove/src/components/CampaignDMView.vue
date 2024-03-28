<template>
  <div>
    <div v-if="loading">Loading...</div>
    <div v-else>
      <h1>{{ campaign.campaignName }}</h1>
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
import { collection, doc, getDocs, getDoc } from 'firebase/firestore';



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
      const campaignDocSnap = await getDoc(campaignDocRef);

      if (campaignDocSnap.exists()) {
        campaign.value = { id: campaignDocSnap.id, ...campaignDocSnap.data() };

        const playersCollectionRef = collection(campaignDocRef, 'players');
        const playersQuerySnapshot = await getDocs(playersCollectionRef);

        playersQuerySnapshot.forEach((doc) => {
          players.value.push({ id: doc.id, ...doc.data() });
        });
      } else {
        console.log('No such document!');
      }
    });

    return { campaign, players, monsters, characters, items, newPlayerEmail, selectedMonster, selectedItem };
  },
};
</script>

<style scoped>
/* your styles */
</style>
