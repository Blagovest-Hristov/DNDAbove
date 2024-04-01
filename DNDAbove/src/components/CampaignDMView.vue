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
    <button @click="showMonsterList = !showMonsterList" class="btn btn-primary">{{ showMonsterList ? 'Hide' : 'Show' }}
      Monster List</button>
    <div v-if="showMonsterList">
      <input v-model="monsterSearchQuery" placeholder="Search for a monster" class="form-control">
      <ul class="list-group-item">
        <li v-for="monster in filteredCampaignMonsters" :key="monster.id" @click="activateMonster(monster)">
          {{ monster.name }}
        </li>
      </ul>
    </div>
    <select v-model="selectedMonster" class="form-select">
      <option v-for="monster in monsters" :key="monster.index" :value="monster">
        {{ monster.name }}
      </option>
    </select>
    <button @click="addMonsterToCampaign" class="btn btn-primary">Add Monster</button>


    <h2>Active Monsters</h2>
    <ul>
      <li v-for="(monster, index) in activeMonsters" :key="monster.id">
        <h3>{{ monster.name }}</h3>
        - HP:
        <input type="number" v-model="monster.hp" @change="checkHP(index)" class="form-control">
      </li>
    </ul>

    <h2>Items</h2>
    <select v-model="selectedItem" class="form-select">
      <option v-for="item in items" :key="item.index" :value="item">
        {{ item.name }}
      </option>
    </select>
    <button @click="addItemToCampaign" class="btn btn-primary">Add Item</button>

    <h2>Characters</h2>
    <ul>
      <li v-for="character in characters" :key="character.id">
        {{ character.name }}
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { firestore } from './firebase';
import { collection, doc, getDocs, getDoc, addDoc, query, where } from 'firebase/firestore';
import { useRoute, useRouter } from 'vue-router';


export default {
  props: ['campaignId'],
  setup(props) {
    const campaign = ref(null);
    const players = ref([]);
    const monsters = ref([]);
    const campaignMonsters = ref([]);
    const characters = ref([]);
    const items = ref([]);
    const newPlayerEmail = ref('');
    const selectedMonster = ref(null);
    const selectedItem = ref(null);
    const monsterSearchQuery = ref('');
    const showMonsterList = ref(true);
    const activeMonsters = ref([]);

    const route = useRoute();
    const router = useRouter();
    const db = firestore;
    const campaignDocRef = doc(db, 'campaigns', props.campaignId);

    const filteredCampaignMonsters = computed(() => {
      if (!monsterSearchQuery.value) {
        return campaignMonsters.value;
      }

      return campaignMonsters.value.filter(monster => monster.name.toLowerCase().includes(monsterSearchQuery.value.toLowerCase()));
    });

    onMounted(async () => {
      console.log(filteredCampaignMonsters)
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

        if (campaign.value.dm !== route.params.userId) {
          router.push(`/player/${props.campaignId}`);
        }

        const playersCollectionRef = collection(db, 'campaigns', props.campaignId, 'players');
        const playersQuerySnapshot = await getDocs(playersCollectionRef);
        for (let docSnapshot of playersQuerySnapshot.docs) {
          const playerDocRef = docSnapshot.data().ref;
          if (playerDocRef) {
            const playerDocSnap = await getDoc(playerDocRef);
            if (playerDocSnap.exists()) {
            players.value.push({ id: playerDocSnap.id, username: playerDocSnap.data().username });
          }          } else {
            console.log('No account with this email');
          }
         
        }

        // Fetch monsters from the subcollection
        const monstersCollectionRef = collection(db, 'campaigns', props.campaignId, 'monsters');
        const monstersQuerySnapshot = await getDocs(monstersCollectionRef);
        campaignMonsters.value = monstersQuerySnapshot.docs.map(doc => doc.data());
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
        } else {
          console.log('No such document in players collection!');
        }
        newPlayerEmail.value = '';
      }
    };

    const addMonsterToCampaign = async () => {
      const monstersCollectionRef = collection(campaignDocRef, 'monsters');
      await addDoc(monstersCollectionRef, selectedMonster.value);
      campaignMonsters.value.push(selectedMonster.value);
    };

    const addItemToCampaign = async () => {
      const itemsCollectionRef = collection(campaignDocRef, 'items');
      await addDoc(itemsCollectionRef, selectedItem.value);
    };

    const activateMonster = async (monster) => {
      activeMonsters.value.push(monster);
      if (!campaignMonsters.value.includes(monster)) {
        campaignMonsters.value.push(monster);
      }

      const slug = formatSlug(monster.name);
      const response = await fetch(`https://www.dnd5eapi.co/api/monsters/${slug}`);
      const data = await response.json();
      monster.hp = data.hit_points;
    };

    const checkHP = (index) => {
      if (activeMonsters.value[index].hp <= 0) {
        activeMonsters.value.splice(index, 1);
      }
    };

    const decreaseHP = (index, amount) => {
      activeMonsters.value[index].hp -= amount;
      if (activeMonsters.value[index].hp <= 0) {
        activeMonsters.value.splice(index, 1);
      }
    };

    const formatSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-');
    };

    return {
      checkHP,
      decreaseHP,
      activeMonsters,
      activateMonster,
      campaign,
      players,
      monsters,
      campaignMonsters,
      filteredCampaignMonsters,
      characters,
      items,
      newPlayerEmail,
      selectedMonster,
      selectedItem,
      monsterSearchQuery,
      showMonsterList,
      addPlayer,
      addMonsterToCampaign,
      addItemToCampaign,
    };
  },
};
</script>

<style scoped>
/* your styles */
</style>