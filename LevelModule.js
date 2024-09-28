// LevelModule.js

import VitalModule from './vital.js';
import SkillModule from './skill.js';
import { updateHPMPOnLevelChange } from './vital.js';

const LevelModule = {
    currentLevel: 1,
    vitalPoints: 12,
    skillPoints: 18,
    eventListenersAttached: false,

    init() {
        console.log('Initializing LevelModule');
        console.log('Initial level:', this.currentLevel);
        this.updateLevel(this.currentLevel);
        if (!this.eventListenersAttached) {
            this.setupEventListeners();
        }
    },

    setupEventListeners() {
        if (this.eventListenersAttached) {
            console.log('Event listeners already attached, skipping');
            return;
        }
    
        const incrementButton = document.getElementById('increment-level');
        const decrementButton = document.getElementById('decrement-level');
    
        if (incrementButton && decrementButton) {
            incrementButton.addEventListener('click', () => {
                console.log('Increment button clicked');
                this.changeLevel(1);
            });
            decrementButton.addEventListener('click', () => {
                console.log('Decrement button clicked');
                this.changeLevel(-1);
            });
            this.eventListenersAttached = true;
            console.log('Event listeners attached');
        } else {
            console.error('Level buttons not found');
        }
    },

    changeLevel(change) {
        console.log('changeLevel called with change:', change);
        console.log('Current level before change:', this.currentLevel);
        const newLevel = Math.max(this.currentLevel + change, 1);
        console.log('Calculated new level:', newLevel);
        if (newLevel !== this.currentLevel) {
            this.updateLevel(newLevel);
        } else {
            console.log('Level did not change');
        }
    },

    updateLevel(newLevel) {
        console.log('updateLevel called with newLevel:', newLevel);
        const oldLevel = this.currentLevel;
        this.currentLevel = Math.min(Math.max(newLevel, 1), 100);
        console.log('Updated currentLevel:', this.currentLevel);
        
        const levelElement = document.getElementById('character-level');
        if (levelElement) {
            levelElement.textContent = this.currentLevel;
        } else {
            console.error('character-level element not found');
        }
    
        const [vitalPointsChange, skillPointsChange] = this.calculatePointsChange(oldLevel, this.currentLevel);
        this.vitalPoints += vitalPointsChange;
        this.skillPoints += skillPointsChange;
    
        VitalModule.setAvailablePoints(this.vitalPoints);
        SkillModule.setAvailablePoints(this.skillPoints);
    
        this.updateButtonStates();
        VitalModule.updateLevel(this.currentLevel);
        updateHPMPOnLevelChange();
    },

    calculatePointsChange(oldLevel, newLevel) {
        const levelRanges = [
            { max: 10, vitalPoints: 1, skillPoints: 2 },
            { max: 20, vitalPoints: 2, skillPoints: 4 },
            { max: 30, vitalPoints: 3, skillPoints: 6 },
            { max: 40, vitalPoints: 4, skillPoints: 8 },
            { max: 50, vitalPoints: 5, skillPoints: 10 },
            { max: 60, vitalPoints: 6, skillPoints: 12 },
            { max: 70, vitalPoints: 7, skillPoints: 14 },
            { max: 80, vitalPoints: 8, skillPoints: 16 },
            { max: 90, vitalPoints: 9, skillPoints: 18 },
            { max: 100, vitalPoints: 10, skillPoints: 20 },
        ];

        let vitalPointsChange = 0;
        let skillPointsChange = 0;

        for (let level = Math.min(oldLevel, newLevel); level < Math.max(oldLevel, newLevel); level++) {
            const range = levelRanges.find(r => level < r.max);
            if (range) {
                vitalPointsChange += range.vitalPoints;
                skillPointsChange += range.skillPoints;
            }
        }

        if (oldLevel > newLevel) {
            vitalPointsChange = -vitalPointsChange;
            skillPointsChange = -skillPointsChange;
        }

        return [vitalPointsChange, skillPointsChange];
    },

    updateButtonStates() {
        const decrementButton = document.getElementById('decrement-level');
        const incrementButton = document.getElementById('increment-level');

        if (decrementButton && incrementButton) {
            decrementButton.disabled = this.currentLevel <= 1;
            incrementButton.disabled = this.currentLevel >= 100;
        }
    },

    loadSavedData(data) {
        if (data) {
            this.currentLevel = data.currentLevel || 1;
            this.vitalPoints = data.vitalPoints || 12;
            this.skillPoints = data.skillPoints || 18;
            this.updateLevel(this.currentLevel);
        }
    },

    getCurrentLevel() {
        return this.currentLevel;
    }
};

export default LevelModule;