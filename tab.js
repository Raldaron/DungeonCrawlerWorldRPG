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

        console.log('Setting up subtab event listeners');
        document.querySelectorAll('.subtablink').forEach(subtablink => {
            console.log('Adding click listener to subtab:', subtablink.dataset.subtab);
            subtablink.addEventListener('click', (event) => {
                console.log('Subtab clicked:', event.target.dataset.subtab);
                this.openSubTab(event.target.dataset.subtab);
            });
        });
    },

    openTab(tabName) {
        console.log('Opening tab:', tabName);
        
        const tabcontents = document.getElementsByClassName("tabcontent");
        const tablinks = document.getElementsByClassName("tablink");
    
        console.log('Number of tabcontent elements:', tabcontents.length);
        console.log('Number of tablink elements:', tablinks.length);
    
        Array.from(tabcontents).forEach(tab => {
            console.log('Hiding tab content:', tab.id);
            tab.style.display = "none";
        });
    
        Array.from(tablinks).forEach(link => {
            console.log('Removing active class from tab:', link.dataset.tab);
            link.classList.remove("active");
        });
    
        const selectedTab = document.getElementById(tabName);
        if (selectedTab) {
            console.log('Displaying selected tab:', tabName);
            selectedTab.style.display = "block";
        } else {
            console.error(`Tab ${tabName} not found`);
        }
    
        const activeTabLink = document.querySelector(`.tablink[data-tab="${tabName}"]`);
        if (activeTabLink) {
            console.log('Setting active class on tab:', tabName);
            activeTabLink.classList.add("active");
        } else {
            console.error(`Tablink for ${tabName} not found`);
        }
    
        if (tabName === 'Stats') {
            this.openSubTab('Vitals');
        }
    },

    openSubTab(subtabName) {
        console.log('Opening subtab:', subtabName);
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