<template>
    <div v-if="character" class="character-view">
      <div class="character-info">
        <div class="character-header">
          <img :src="character.photo" alt="Character Image" class="character-image">
          <h1>{{ character.name }}</h1>
        </div>
        <div class="character-details">
          <p><strong>Class:</strong> {{ character.class }}</p>
          <p><strong>Race:</strong> {{ character.race }}</p>
          <p v-if="character.subrace"><strong>Subrace:</strong> {{ character.subrace }}</p>
          <p><strong>Archetype:</strong> {{ character.archetype }}</p>
          <p><strong>Health:</strong> {{ character.health }}</p>
          <p><strong>Attributes:</strong></p>
          <ul class="attribute-list">
            <li><strong>Strength:</strong> {{ character.STR }}</li>
            <li><strong>Dexterity:</strong> {{ character.DXT }}</li>
            <li><strong>Constitution:</strong> {{ character.CONS }}</li>
            <li><strong>Intelligence:</strong> {{ character.INT }}</li>
            <li><strong>Wisdom:</strong> {{ character.WIS }}</li>
            <li><strong>Charisma:</strong> {{ character.CHA }}</li>
          </ul>
  
          <button @click="showSpells = !showSpells" class="toggle-button">{{ showSpells ? 'Hide' : 'Show' }} Spells and Cantrips</button>
          <div v-if="showSpells" class="spells-section">
            <h2>Spells:</h2>
            <ul class="spell-list">
              <li v-for="(spell, index) in [character.spell1, character.spell2, character.spell3, character.spell4]" :key="index">
                <h3>{{ spell }}:</h3>
                {{ spellDescriptions[spell] }}
              </li>
            </ul>
            <h2>Cantrips:</h2>
            <ul class="spell-list">
              <li v-for="(cantrip, index) in [character.cantrip1, character.cantrip2]" :key="index">
                <h3>{{ cantrip }}:</h3>
                {{ spellDescriptions[cantrip] }}
              </li>
            </ul>
          </div>
  
          <button @click="showModal = true" class="toggle-button">Show Spellcasting Info</button>
          <div v-if="showModal" class="custom-modal">
            <div class="custom-modal-content">
              <span class="custom-close" @click="showModal = false">&times;</span>
              <h2>Spellcasting Info for {{ character.class }}</h2>
              <p><strong>Level:</strong> {{ spellcasting.level }}</p>
              <p><strong>Spellcasting Ability:</strong> {{ spellcasting.spellcasting_ability.name }}</p>
              <ul>
                <li v-for="(info, index) in spellcasting.info" :key="index">
                  <h3>{{ info.name }}</h3>
                  <p v-for="(desc, index) in info.desc" :key="index">{{ desc }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  
      <div class="skills-section">
        <h2>Skills</h2>
        <table class="skills-table">
          <thead>
            <tr>
              <th>Skill</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(value, skill) in skillValues" :key="skill">
              <td>{{ skill }}</td>
              <td>{{ value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else class="loading-message">Loading...</div>
  </template>

<script>
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from './firebase';

export default {
    props: ['campaignId', 'characterId'],
    data() {
        return {
            character: null,
            spellDescriptions: {},
            showModal: false,
            spellcasting: null,
            showSpells: false
        };
    },
    methods: {
        async fetchSpellDescriptions(spellNames) {
            for (let spellName of spellNames) {
                const slug = spellName.toLowerCase().replace(/ /g, '-').replace(/'|’/g, '');
                const response = await fetch(`https://api.open5e.com/spells/${slug}`);
                const data = await response.json();
                this.spellDescriptions[spellName] = data.desc;
            }
        },
        async fetchSpellcastingInfo(className) {
            const response = await fetch(`https://www.dnd5eapi.co/api/classes/${className.toLowerCase()}/spellcasting`);
            const data = await response.json();
            console.log(data);  // Log the fetched data

            this.spellcasting = data;
        }
    },
    computed: {
        skillValues() {
            const skills = {
                'Acrobatics': this.character.DXT,
                'Animal Handling': this.character.WIS,
                'Arcana': this.character.INT,
                'Athletics': this.character.STR,
                'Deception': this.character.CHA,
                'History': this.character.INT,
                'Insight': this.character.WIS,
                'Intimidation': this.character.CHA,
                'Investigation': this.character.INT,
                'Medicine': this.character.WIS,
                'Nature': this.character.INT,
                'Perception': this.character.WIS,
                'Performance': this.character.CHA,
                'Persuasion': this.character.CHA,
                'Religion': this.character.INT,
                'Sleight of Hand': this.character.DXT,
                'Stealth': this.character.DXT,
                'Survival': this.character.WIS
            };
            const proficiencies = [this.character.prof_skill1, this.character.prof_skill2];
            for (let skill in skills) {
                if (proficiencies.includes(skill)) {
                    skills[skill] += 2;
                }
            }
            return skills;
        }
    },
    async created() {
        const characterDoc = doc(firestore, 'campaigns', this.campaignId, 'characters', this.characterId);
        const docSnap = await getDoc(characterDoc);
        if (docSnap.exists) {
            this.character = docSnap.data();
            await this.fetchSpellDescriptions([this.character.spell1, this.character.spell2, this.character.spell3, this.character.spell4, this.character.cantrip1, this.character.cantrip2]);
            await this.fetchSpellcastingInfo(this.character.class.toLowerCase());
        } else {
            console.log('No such document!');
        }
    }
}
</script>



<style scoped>
.character-view {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 20px;
}

.character-info {
width: 70%;
background-color: gray;
padding: 20px;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.character-header {
display: flex;
align-items: center;
}

.character-image {
width: 100px;
height: 100px;
border-radius: 50%;
margin-right: 20px;
object-fit: cover;
border: 2px solid #333;
}

.character-info h1 {
color: #333;
margin-bottom: 10px;
}

.character-details p {
margin-bottom: 8px;
color: black;
}

.toggle-button {
margin-top: 15px;
padding: 8px 12px;
background-color: #e02b2b;
color: #fff;
border: none;
border-radius: 4px;
cursor: pointer;
}

.spells-section {
margin-top: 20px;
}

.spell-list {
list-style: none;
padding-left: 0;
}

.spell-list li {
margin-bottom: 12px;
}

.custom-modal {
position: fixed;
z-index: 1;
left: 0;
top: 0;
width: 100%;
height: 100%;
overflow: auto;
background-color: rgba(0, 0, 0, 0.4);
}

.custom-modal-content {
background-color: darkgray;
margin: 10% auto;
padding: 20px;
border-radius: 8px;
width: 80%;
max-width: 600px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.custom-close {
color: black;
float: right;
font-size: 24px;
font-weight: bold;
cursor: pointer;
}

.skills-section {
width: 30%;
padding: 20px;
background-color: gray;
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
margin-left: 20px;
}

.skills-section h2 {
color: #333;
margin-bottom: 12px;
}

.skills-table {
width: 100%;
border-collapse: collapse;
}

.skills-table th,
.skills-table td {
border: 1px solid black;
padding: 10px;
}

.loading-message {
display: flex;
justify-content: center;
align-items: center;
font-size: 18px;
height: 100px;
color: #666;
}
</style>