// APModule.js

const APModule = {
    apValue: 0,

    init() {
        this.apContainer = document.getElementById('ap-container');
        this.apElement = document.getElementById('character-ap');
        this.apButtons = document.getElementById('ap-buttons');
        this.apIncrement = document.getElementById('ap-increment');
        this.apDecrement = document.getElementById('ap-decrement');

        this.setupEventListeners();
        this.updateAPDisplay();
    },

    setupEventListeners() {
        this.apIncrement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeAP(1);
        });
        this.apDecrement.addEventListener('click', (e) => {
            e.stopPropagation();
            this.changeAP(-1);
        });
        },

    changeAP(delta) {
        if (this.apElement) {
            this.apValue = Math.max(0, parseInt(this.apElement.textContent, 10) + delta);
            this.updateAPDisplay();
        } else {
            console.error('AP element not found');
        }
    },

        updateAPDisplay() {
            if (this.apElement) {
                this.apElement.textContent = this.apValue;
            } else {
                console.error('AP element not found');
            }
        },

        getAP() {
            return this.apValue;
        },

    loadSavedData(data) {
        if (data !== undefined) {
            this.apValue = data;
            this.updateAPDisplay();
        }
    },
};

export default APModule;