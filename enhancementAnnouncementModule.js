// enhancementAnnouncementModule.js

const EnhancementAnnouncementModule = {
    init() {
        this.createAnnouncementModal();
    },

    createAnnouncementModal() {
        const modal = document.createElement('div');
        modal.id = 'enhancement-announcement-modal';
        modal.className = 'modal centered-popup'; // Change to 'centered-popup'
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Congratulations!</h2>
                <p id="enhancement-announcement-message"></p>
                <button id="view-enhancement-details">View Details</button>
            </div>
        `;
        document.body.appendChild(modal);

        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = () => {
            this.closeModal();
        };

        window.onclick = (event) => {
            if (event.target == modal) {
                this.closeModal();
            }
        };

        const viewDetailsBtn = modal.querySelector('#view-enhancement-details');
        viewDetailsBtn.onclick = () => {
            this.viewEnhancementDetails();
        };
    },

    announceNewEnhancement(enhancement) {
        const modal = document.getElementById('enhancement-announcement-modal');
        const message = document.getElementById('enhancement-announcement-message');
        message.textContent = `You have unlocked a new enhancement: ${enhancement.name}!`;
        modal.style.display = 'block';

        // Store the current enhancement for the details view
        this.currentEnhancement = enhancement;

        // Set a timeout to automatically close the announcement after 5 seconds
        setTimeout(() => {
            this.closeModal();
        }, 5000);
    },

    closeModal() {
        const modal = document.getElementById('enhancement-announcement-modal');
        modal.style.display = 'none';
    },

    viewEnhancementDetails() {
        if (this.currentEnhancement) {
            EnhancementModule.showEnhancementDetails(this.currentEnhancement.name);
        }
        this.closeModal();
    }
};

export default EnhancementAnnouncementModule;