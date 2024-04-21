<template>
  <div class="container">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else>
      <h1 v-if="campaign" class="campaign-name">{{ campaign.campaignName }}</h1>
    </div>

    <div class="section">
      <h2>Players</h2>
      <div class="input-container">
        <input v-model="newPlayerEmail" placeholder="Enter player email" class="form-control">
        <button @click="addPlayer" class="btn btn-primary">Add Player</button>
      </div>
      <ul class="list">
        <li v-for="player in players" :key="player.id">{{ player.username }}</li>
      </ul>
    </div>

    <div class="section">
      <h2>Monsters</h2>
      <button @click="toggleMonsterList" class="btn btn-primary">
        {{ showMonsterList ? 'Hide Monster List' : 'Show Monster List' }}
      </button>
      <div v-if="showMonsterList" class="monster-list-container">
        <input v-model="monsterSearchQuery" placeholder="Search for a monster" class="form-control">
        <ul class="list">
          <li v-for="monster in filteredCampaignMonsters" :key="monster.id" @click="activateMonster(monster)">
            {{ monster.name }}
          </li>
        </ul>
      </div>
      <select v-model="selectedMonster" class="form-select item-select">
        <option v-for="monster in monsters" :key="monster.index" :value="monster">{{ monster.name }}</option>
      </select>
      <button @click="addMonsterToCampaign" class="btn btn-primary">Add Monster</button>
      <div class="active-monsters">
        <h2>Active Monsters</h2>
        <ul class="list">
          <li v-for="(monster, index) in activeMonsters" :key="monster.id">
            <h3>{{ monster.name }}</h3>
            <div class="input-container">
              <label>HP:</label>
              <input type="number" v-model="monster.hp" @change="checkHP(index)" class="form-control">
            </div>
          </li>
        </ul>
      </div>
    </div>

    <div class="section">
      <h2>Items</h2>
      <select v-model="selectedItem" class="form-select item-select">
        <option v-for="item in items" :key="item.index" :value="item">{{ item.name }}</option>
      </select>
      <button @click="addItemToCampaign" class="btn btn-primary">Add Item</button>
    </div>

    <div class="section">
      <h2>Characters</h2>
      <ul class="list character-list">
        <li v-for="character in characters" :key="character.id">{{ character.name }}</li>
      </ul>
    </div>
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
            }
          } else {
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
      if (newPlayerEmail.value) {
        const usersCollectionRef = collection(db, 'players');
        const q = query(usersCollectionRef, where('email', '==', newPlayerEmail.value));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDocSnap = querySnapshot.docs[0];
          const playerData = { ref: userDocSnap.ref };
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

    const formatSlug = (name) => {
      return name.toLowerCase().replace(/\s+/g, '-');
    };

    const toggleMonsterList = () => {
      showMonsterList.value = !showMonsterList.value;
    };

    return {
      campaign,
      players,
      monsters,
      campaignMonsters,
      characters,
      items,
      newPlayerEmail,
      selectedMonster,
      selectedItem,
      monsterSearchQuery,
      showMonsterList,
      activeMonsters,
      addPlayer,
      addMonsterToCampaign,
      addItemToCampaign,
      activateMonster,
      checkHP,
      toggleMonsterList,
      filteredCampaignMonsters
    };
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}

.loading {
  font-size: 18px;
  margin-top: 20px;
}

.campaign-name {
  margin: 20px 0;
  font-size: 24px;
}

.section {
  width: 100%;
  max-width: 600px;
  margin-top: 20px;
  padding: 20px;
  border: 1px solid ;
  border-radius: 8px;
  background-color: darkgray;
}

.input-container {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.input-container label {
  font-weight: bold;
  margin-right: 10px;
}

.input-container input,
.input-container select {
  flex: 1;
  padding: 10px;
  margin-right: 10px;
  border: 1px solid darkgray;
  border-radius: 4px;
}
button {
  background-color: #e02b2b; /* A shade of red for button color */
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  transition-duration: 0.4s;
  cursor: pointer;
}
button:hover {
  background-color: darkred; /* Darker shade of red for button hover color */
}

.list-group-item {
  background-color: #333; /* Dark gray background color */
  color: white; /* White text color */
  border: none; /* Remove border */
}


.button-container {
  margin-top: 10px;
}

.button-container button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  background-color: #e02b2b;
  color: #fff;
  font-size: 16px;
}

.button-container button:hover {
  background-color: #e02b2b;
}

.list {
  list-style-type: none;
  padding: 0;
}

.list li {
  margin-top: 10px;
  font-size: 16px;
}

.monster-list-container {
  margin-top: 10px;
}

.monster-list-container input {
  width: 100%;
  padding: 10px;
  border: 1px solid darkgray;
  border-radius: 4px;
  margin-top: 10px;
}

.active-monsters {
  margin-top: 20px;
}

.active-monsters input[type="number"] {
  width: 80px;
  margin-left: auto;
}

.item-select {
  margin-top: 10px;
  width: 100%;
}

.character-list {
  margin-top: 20px;
}

.character-list li {
  margin-top: 10px;
  font-size: 16px;
}
</style>
