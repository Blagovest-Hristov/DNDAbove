<template>
    <div>
        <h1>Welcome to your Vue page!</h1>
        <p>Campaign ID: {{ campaignId }}</p> <!-- Display the campaign ID -->

        <h2>Your Characters</h2>
        <div v-if="isLoading">
            Loading...
        </div>
        <div v-else>
            <ul>
                <li v-for="(character, index) in characters" :key="index">
                    <router-link :to="`/campaign/${campaignId}/character/${character.id}`">
                        {{ character.name }}
                    </router-link>
                </li>
            </ul>
        </div>


        <button @click="openCreateCharacterForm">Create Character</button>

        <!-- Character creation form -->
        <div v-if="showCharacterForm" class="form-container">
            <input type="file" @change="uploadPhoto" class="photo-input">
            <input v-model="character.name" placeholder="Name" class="name-input">
            <input v-model.number="character.health" placeholder="Health" type="number" min="0" max="20"
                class="health-input">
            <input v-model="character.STR" placeholder="STR" class="stat-input">
            <input v-model="character.DXT" placeholder="DXT" class="stat-input">
            <input v-model="character.CONS" placeholder="CONS" class="stat-input">
            <input v-model="character.WIS" placeholder="WIS" class="stat-input">
            <input v-model="character.INT" placeholder="INT" class="stat-input">
            <input v-model="character.CHA" placeholder="CHA" class="stat-input">
            <button @click="assignStandardArray">Assign Standard Array</button>
        </div>

        <div v-if="showCharacterForm" class="form-container">
            <!-- ...your other input fields... -->
            <select v-model="character.race" class="race-select">
                <option v-for="race in races" :key="race.slug" :value="race.name">{{ race.name }}</option>
            </select>
            <select v-if="showSubraceForm" v-model="character.subrace" class="subrace-select">
                <option v-for="subrace in subraces" :key="subrace.slug" :value="subrace.name">{{ subrace.name }}
                </option>
            </select>
        </div>



        <div v-if="showCharacterForm" class="form-container">
            <select v-model="character.class" class="class-select">
                <option v-for="classObj in classes" :key="classObj.slug" :value="classObj.name">{{ classObj.name }}
                </option>
            </select>
            <select v-if="showArchetypeForm" v-model="character.archetype" class="archetype-select">
                <option v-for="archetype in archetypes" :key="archetype.slug" :value="archetype.name">{{ archetype.name
                    }}</option>
            </select>

        </div>

        <div v-if="showCharacterForm" class="form-container">

            <select v-model="character.prof_skill1" class="prof-skill-select">
                <option v-for="skill in profSkills" :key="skill" :value="skill">{{ skill }}</option>
            </select>
            <select v-model="character.prof_skill2" class="prof-skill-select">
                <option v-for="skill in profSkills" :key="skill" :value="skill">{{ skill }}</option>
            </select>

            <select v-model="character.spell1" class="spell-select">
                <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}</option>
            </select>
            <select v-model="character.spell2" class="spell-select">
                <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}</option>
            </select>
            <select v-model="character.spell3" class="spell-select">
                <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}</option>
            </select>
            <select v-model="character.spell4" class="spell-select">
                <option v-for="spell in level1Spells" :key="spell.slug" :value="spell.name">{{ spell.name }}</option>
            </select>
            <select v-model="character.cantrip1" class="cantrip-select">
                <option v-for="cantrip in cantrips" :key="cantrip.slug" :value="cantrip.name">{{ cantrip.name }}
                </option>
            </select>
            <select v-model="character.cantrip2" class="cantrip-select">
                <option v-for="cantrip in cantrips" :key="cantrip.slug" :value="cantrip.name">{{ cantrip.name }}
                </option>
            </select>
        </div>

        <div v-if="showCharacterForm" class="form-container">
            <!-- ...your other input fields... -->
            <button @click="uploadCharacter">Upload Character</button>
        </div>

        <!-- Add your page content here -->
    </div>
</template>

<script>

import { auth, firestore,storage } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs} from 'firebase/firestore';
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
.form-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.stat-input {
    width: 50px;
    /* Adjust this value to change the width of the input fields */
}

.race-select {
    width: 200px;
    /* Adjust this value to change the width of the select field */
    height: 3rem;
    margin-top: 20px;
    /* Adjust this value to change the vertical position of the select field */
}
</style>