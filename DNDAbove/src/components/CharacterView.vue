<template>
    <div v-if="character" class="character-view">
        <div class="character-info">
            <div class="character-header">
                <img :src="character.photo" alt="Character Image" class="character-image">
                <h1>{{ character.name }}</h1>
              </div>
            <p>Class: {{ character.class }}</p>
            <p>Race: {{ character.race }}</p>
            <p>Subrace: {{ character.subrace }}</p>
            <p>Archetype: {{ character.archetype }}</p>
            <p>Health: {{ character.health }}</p>
            <p>Strength: {{ character.STR }}</p>
            <p>Dexterity: {{ character.DXT }}</p>
            <p>Constitution: {{ character.CONS }}</p>
            <p>Intelligence: {{ character.INT }}</p>
            <p>Wisdom: {{ character.WIS }}</p>
            <p>Charisma: {{ character.CHA }}</p>
            <p>Proficient Skills: {{ character.prof_skill1 }}, {{ character.prof_skill2 }}</p>
            <button @click="showSpells = !showSpells">{{ showSpells ? 'Hide' : 'Show' }} Spells and Cantrips</button>
            <div v-if="showSpells">
                <h1>Spells:</h1>
                <ul>
                    <li v-for="(spell, index) in [character.spell1, character.spell2, character.spell3, character.spell4]"
                        :key="index">
                        <h3>{{ spell }}:</h3>
                        {{ spellDescriptions[spell] }}
                    </li>
                </ul>
                <p>Cantrips:</p>
                <ul>
                    <li v-for="(cantrip, index) in [character.cantrip1, character.cantrip2]" :key="index">
                        <h3>{{ cantrip }}:</h3>
                        {{ spellDescriptions[cantrip] }}
                    </li>
                </ul>
            </div>
            <button @click="showModal = true">Show Spellcasting Info</button>
            <div v-if="showModal" class="custom-modal">
                <div class="custom-modal-content">
                  <span class="custom-close" @click="showModal = false">&times;</span>
                  
                    <h2>Spellcasting Info for {{ character.class }}</h2>
                    <p>Level: {{ spellcasting.level }}</p>
                    <p>Spellcasting Ability: {{ spellcasting.spellcasting_ability.name }}</p>
                    <ul>
                        <li v-for="(info, index) in spellcasting.info" :key="index">
                            <h3>{{ info.name }}</h3>
                            <p v-for="(desc, index) in info.desc" :key="index">{{ desc }}</p>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
        <div class="skills-section">
            <table class="skills-table">
                <tr>
                    <th>Skill</th>
                    <th>Value</th>
                </tr>
                <tr v-for="(value, skill) in skillValues" :key="skill">
                    <td>{{ skill }}</td>
                    <td>{{ value }}</td>
                </tr>
            </table>
        </div>
    </div>
    <div v-else>Loading...</div>
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
    justify-content: space-between;
    font-family: Arial, sans-serif;
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.character-info {
    width: 70%;  /* Adjust this value to suit your needs */
}

.character-view h1 {
    margin-bottom: 20px;
    color: #333;
}

.character-view p {
    margin-bottom: 10px;
    color: #666;
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
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
  }
  
  .custom-close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
  }
  
  .custom-close:hover,
  .custom-close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
  }

.skills-section {
    width: 30%;  /* Adjust this value to suit your needs */
}

table {
    width: 60%;
    border-collapse: collapse;
}

table,
th,
td {
    border: 1px solid black;
    padding: 10px;
    text-align: left;
}
.character-photo {
    width: 7rem;
    border-radius: 7rem;
    margin-bottom: 10px ;
}

.character-header {
    display: flex;
    align-items: center;
  }
  
  .character-image {
    width: 100px !important;
    height: 100px !important;
    margin-right: 20px !important;
    object-fit: cover !important;
  }
  

</style>