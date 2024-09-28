import SpellModule from './spell.js';
import SkillModule from './skill.js';

// tab.js

const TabModule = {
    init() {
        console.log('Initializing TabModule');
        this.setupEventListeners();
        this.openTab('Main');
    },

    setupEventListeners() {
        console.log('Setting up tab event listeners');
        document.querySelectorAll('.tablink').forEach(tablink => {
            console.log('Adding click listener to tab:', tablink.dataset.tab);
            tablink.addEventListener('click', (event) => {
                console.log('Tab clicked:', event.target.dataset.tab);
                this.openTab(event.target.dataset.tab);
            });
        });

        document.querySelectorAll('.subtablink').forEach(subtablink => {
            subtablink.addEventListener('click', (event) => {
                console.log('Subtab clicked:', event.target.dataset.subtab);
                this.openSubTab(event.target.dataset.subtab);
            });
        });
    },

    openTab(tabName) {
        
        const tabcontents = document.getElementsByClassName("tabcontent");
        const tablinks = document.getElementsByClassName("tablink");

        Array.from(tabcontents).forEach(tab => {
            tab.style.display = "none";
        });

        Array.from(tablinks).forEach(link => {
            link.classList.remove("active");
        });

        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            selectedTab.style.display = "block";
        } else {
            console.error(`Tab ${tabName} not found`);
        }

        const activeTabLink = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        if (activeTabLink) {
            activeTabLink.classList.add("active");
        } else {
            console.error(`Tab link for ${tabName} not found`);
        }

        if (tabName === 'Stats') {
            this.openSubTab('Vitals');
        }
    },

    openSubTab(subtabName) {
        const subtabcontent = document.getElementsByClassName("subtabcontent");
        for (let i = 0; i < subtabcontent.length; i++) {
            subtabcontent[i].style.display = "none";
        }

        const subtablinks = document.getElementsByClassName("subtablink");
        for (let i = 0; i < subtablinks.length; i++) {
            subtablinks[i].classList.remove("active");
        }

        const selectedSubtab = document.getElementById(subtabName);
        if (selectedSubtab) {
            selectedSubtab.style.display = "block";
        } else {
            console.error(`Subtab ${subtabName} not found`);
        }

        const activeSubtabLink = document.querySelector(`.subtablink[data-subtab="${subtabName}"]`);
        if (activeSubtabLink) {
            activeSubtabLink.classList.add("active");
        }
    }
};

export default TabModule;