<template>
    <div class="container">
        <div class="text-center mb-4">
            <p>Campaign ID: {{ campaignId }}</p>
        </div>

        <h2 class="text-center">Your Characters</h2>
        <div v-if="isLoading" class="text-center">
            Loading...
        </div>

        <div v-else>
            <ul class="character-list">
                <li v-for="(character, index) in characters" :key="index" class="character-item">
                    <router-link :to="`/campaign/${campaignId}/character/${character.id}`" class="character-link">
                        <div class="character-card">
                            <div class="character-info">
                                <img :src="character.photo" alt="" class="character-photo">
                                <h3>{{ character.name }}</h3>
                                <p>Health: {{ character.health }}</p>
                                <p>Race: {{ character.race }}</p>
                                <p>Class: {{ character.class }}</p>
                            </div>
                        </div>
                    </router-link>
                </li>
            </ul>
        </div>

        <div class="text-center mt-4">
            <button @click="openCreateCharacterForm" class="btn btn-primary">Create Character</button>
        </div>

        <div v-if="showCharacterForm" class="mt-4">
            <form @submit.prevent="uploadCharacter" class="row justify-content-center">
                <div class="col-md-6">
                    <label for="characterPhoto">Character Photo:</label>
                    <input type="file" id="characterPhoto" @change="uploadPhoto" class="form-control mb-3"
                        placeholder="Upload Character Photo">

                    <label for="characterName">Name:</label>
                    <input v-model="character.name" id="characterName" class="form-control mb-3" required>

                    <label for="characterHealth">Health:</label>
                    <input v-model.number="character.health" id="characterHealth" type="number" min="0" max="20"
                        class="form-control mb-3">

                    <label for="characterSTR">Strength (STR):</label>
                    <input v-model="character.STR" id="characterSTR" class="form-control mb-3">

                    <label for="characterDXT">Dexterity (DXT):</label>
                    <input v-model="character.DXT" id="characterDXT" class="form-control mb-3">

                    <label for="characterCONS">Constitution (CONS):</label>
                    <input v-model="character.CONS" id="characterCONS" class="form-control mb-3">

                    <label for="characterWIS">Wisdom (WIS):</label>
                    <input v-model="character.WIS" id="characterWIS" class="form-control mb-3">

                    <label for="characterINT">Intelligence (INT):</label>
                    <input v-model="character.INT" id="characterINT" class="form-control mb-3">

                    <label for="characterCHA">Charisma (CHA):</label>
                    <input v-model="character.CHA" id="characterCHA" class="form-control mb-3">

                    <button @click="assignStandardArray" class="btn btn-secondary mb-3">Assign Standard Array</button>
                </div>

                <div class="col-md-6">
                    <label for="characterRace">Race:</label>
                    <select v-model="character.race" id="characterRace" class="form-select mb-3">
                        <option v-for="race in races" :key="race.slug" :value="race.name">{{ race.name }}</option>
                    </select>

                    <label v-if="showSubraceForm" for="characterSubrace">Subrace:</label>
                    <select v-if="showSubraceForm" v-model="character.subrace" id="characterSubrace"
                        class="form-select mb-3">
                        <option v-for="subrace in subraces" :key="subrace.slug" :value="subrace.name">{{ subrace.name }}
                        </option>
                    </select>

                    <label for="characterClass">Class:</label>
                    <select v-model="character.class" id="characterClass" class="form-select mb-3">
                        <option v-for="classObj in classes" :key="classObj.slug" :value="classObj.name">{{ classObj.name
                            }}</option>
                    </select>

                    <label v-if="showArchetypeForm" for="characterArchetype">Archetype:</label>
                    <select v-if="showArchetypeForm" v-model="character.archetype" id="characterArchetype"
                        class="form-select mb-3">
                        <option v-for="archetype in archetypes" :key="archetype.slug" :value="archetype.name">{{
                archetype.name }}</option>
                    </select>

                    <label for="characterProfSkill1">Proficiency Skill 1:</label>
                    <select v-model="character.prof_skill1" id="characterProfSkill1" class="form-select mb-3">
                        <option v-for="skill in profSkills" :key="skill" :value="skill">{{ skill }}</option>
                    </select>

                    <label for="characterProfSkill2">Proficiency Skill 2:</label>
                    <select v-model="character.prof_skill2" id="characterProfSkill2" class="form-select mb-3">
                        <option v-for="skill in profSkills" :key="skill" :value="skill">{{ skill }}</option>
                    </select>

                    <label for="characterSpell1">Spell 1:</label>
                    <select v-model="character.spell1" id="characterSpell1" class="form-select mb-3">
                        <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}
                        </option>
                    </select>

                    <label for="characterSpell2">Spell 2:</label>
                    <select v-model="character.spell2" id="characterSpell2" class="form-select mb-3">
                        <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}
                        </option>
                    </select>

                    <!-- Additional spell and cantrip fields -->
                    <label for="characterSpell3">Spell 3:</label>
                    <select v-model="character.spell3" id="characterSpell3" class="form-select mb-3">
                        <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}
                        </option>
                    </select>

                    <label for="characterSpell4">Spell 4:</label>
                    <select v-model="character.spell4" id="characterSpell4" class="form-select mb-3">
                        <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}
                        </option>
                    </select>

                    <label for="characterCantrip1">Cantrip 1:</label>
                    <select v-model="character.cantrip1" id="characterCantrip1" class="form-select mb-3">
                        <option v-for="cantrip in cantrips" :key="cantrip.slug" :value="cantrip.name">{{ cantrip.name }}
                        </option>
                    </select>

                    <label for="characterCantrip2">Cantrip 2:</label>
                    <select v-model="character.cantrip2" id="characterCantrip2" class="form-select mb-3">
                        <option v-for="cantrip in cantrips" :key="cantrip.slug" :value="cantrip.name">{{ cantrip.name }}
                        </option>
                    </select>

                    <button @click="uploadCharacter" class="btn btn-success">Upload Character</button>
                </div>
            </form>
        </div>
    </div>
</template>
<script>

import { auth, firestore, storage } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

console.log(firestore);

export default {
    name: 'CampaignPlayerView',
    props: ['campaignId'],
    data() {
        return {
            showCharacterForm: false,
            showSubraceForm: false,
            showArchetypeForm: false, // Add a showArchetypeForm property
            character: {
                name: '',
                health: '',
                STR: '',
                DXT: '',
                CONS: '',
                WIS: '',
                INT: '',
                CHA: '',
                race: '',
                subrace: '',
                class: '', // Add a class property to your character
                archetype: '', // Add an archetype property to your character
                prof_skill1: '', // Add proficiency skill properties to your character
                prof_skill2: '',
                spell1: '',
                spell2: '',
                spell3: '',
                spell4: '',
                cantrip1: '',
                cantrip2: ''
            },
            races: [],
            subraces: [],
            classes: [], // Add a classes property to hold the classes
            archetypes: [], // Add an archetypes property to hold the archetypes
            profSkills: [], // Add a profSkills property to hold the proficiency skills
            allSpells: [],
            selectedClass: '',
            characters: [],
            isLoading: true


        };
    },
    async created() {
        const userId = auth.currentUser.uid;
        const charactersCollection = collection(firestore, 'campaigns', this.campaignId, 'characters');
        const q = query(charactersCollection, where('owner', '==', userId));
        const querySnapshot = await getDocs(q);
        this.characters = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        this.isLoading = false;

        const responseRaces = await fetch('https://api.open5e.com/races/');
        const dataRaces = await responseRaces.json();
        this.races = dataRaces.results;

        const responseClasses = await fetch('https://api.open5e.com/classes/');
        const dataClasses = await responseClasses.json();
        this.classes = dataClasses.results;

        let nextPage = 'https://api.open5e.com/spells/';
        while (nextPage) {
            const responseSpells = await fetch(nextPage);
            const dataSpells = await responseSpells.json();
            this.allSpells = this.allSpells.concat(dataSpells.results);
            nextPage = dataSpells.next;
        }



    },
    watch: {
        'character.race': function (newRace) {
            const race = this.races.find(race => race.name === newRace);
            if (race && race.subraces && race.subraces.length > 0) {
                this.showSubraceForm = true;
                this.subraces = race.subraces;
            } else {
                this.showSubraceForm = false;
            }
        },
        'character.class': async function (newClass) {
            const classObj = this.classes.find(classObj => classObj.name === newClass);
            if (classObj && classObj.archetypes && classObj.archetypes.length > 0) {
                this.showArchetypeForm = true;
                this.archetypes = classObj.archetypes;
            } else {
                this.showArchetypeForm = false;
            }
            if (classObj) {
                this.profSkills = classObj.prof_skills
                    .replace('Choose two from ', '')
                    .split(', ')
                    .map(skill => skill.trim());
                this.selectedClass = newClass; // Update selectedClass

            }



        },

        'allSpells': function () {
            this.level1Spells = this.allSpells.filter(spell => spell.level_int === 1 && spell.dnd_class.includes(this.selectedClass));
            this.cantrips = this.allSpells.filter(spell => spell.level_int === 0 && spell.dnd_class.includes(this.selectedClass));
        }
    },

    methods: {
        openCreateCharacterForm() {
            this.showCharacterForm = true;
        },
        assignStandardArray() {
            const standardArray = [15, 14, 13, 12, 10, 8];
            const shuffledArray = this.shuffleArray(standardArray);

            this.character.STR = shuffledArray[0];
            this.character.DXT = shuffledArray[1];
            this.character.CONS = shuffledArray[2];
            this.character.WIS = shuffledArray[3];
            this.character.INT = shuffledArray[4];
            this.character.CHA = shuffledArray[5];
        },
        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        },

        async uploadCharacter() {
            this.character.owner = auth.currentUser.uid;
            this.character.createdTimestamp = serverTimestamp();
            const charactersCollection = collection(firestore, 'campaigns', this.campaignId, 'characters');
            await addDoc(charactersCollection, this.character);
            alert('Character uploaded successfully!');
        },
        uploadPhoto(event) {
            const file = event.target.files[0];
            const storageRef = ref(storage, 'images/' + file.name);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Calculate the upload progress
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.log(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        this.character.photo = downloadURL;
                    });
                }
            );
        },
    }
}

</script>
<style scoped>
/* Container styles for centering */
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* Ensure full viewport height */
}

/* Margin adjustment for top-level elements */
.text-center {
  margin-bottom: 20px;
}

/* List of characters */
.character-list {
  list-style: none;
  padding: 0;
}

.character-item {
  margin-bottom: 20px;
}

.character-link {
  text-decoration: none;
  color: inherit;
}

.character-card {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  background-color: #f9f9f9;
  transition: transform 0.3s ease;
}

.character-card:hover {
  transform: translateY(-5px);
}

.character-info {
  color: darkred;
}

.character-photo {
  width: 100%; /* Ensure photo fills the container */
  max-width: 200px; /* Limit maximum width */
  height: auto; /* Maintain aspect ratio */
  border-radius: 4px;
  margin-top: 10px;
}

/* Form container */
.form-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 20px;
}

/* Form input and select field styling */
.form-control,
.form-select {
  width: 100%; /* Full width */
  padding: 10px; /* Increased padding for better spacing */
  box-sizing: border-box;
  border: 1px solid #ccc; /* Border color */
  border-radius: 4px; /* Rounded corners */
  margin-bottom: 15px; /* Increased spacing between fields */
}

.health-input,
.stat-input {
  width: calc(50% - 20px); /* Two columns with reduced width */
}

/* Button styling */
.btn {
  width: 100%; /* Full width */
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px; /* Spacing above buttons */
}

/* Primary button style */
.btn-primary {
  background-color: #e02b2b; /* Blue color */
  color: #fff; /* White text */
}

.btn-primary:hover {
  background-color: darkred; /* Darker blue on hover */
}

/* Secondary button style */
.btn-secondary {
  background-color: #6c757d; /* Gray color */
  color: #fff; /* White text */
}

.btn-secondary:hover {
  background-color: #5a6268; /* Darker gray on hover */
}
</style>
