document.addEventListener("DOMContentLoaded", function () {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");

  // Start with the sidebar collapsed
  sidebar.classList.add("collapsed");
  content.classList.add("full-width"); // Ensure this class exists in your CSS

  sidebarToggle.addEventListener("click", function () {
    sidebar.classList.toggle("collapsed");
    content.classList.toggle("full-width"); // Ensure this class exists in your CSS
  });

  document.querySelectorAll(".sidebar ul li").forEach((item) => {
    item.addEventListener("click", function () {
      changeSection(this.id);
      if (window.innerWidth < 361) {
        sidebar.classList.add("collapsed");
        content.classList.add("full-width");
      }
    });
  });

  showCover();
});

function changeSection(sectionId) {
  const contentArea = document.querySelector(".content");
  const sectionData = sectionContent[sectionId];

  if (sectionData) {
    contentArea.innerHTML = `<h1>${sectionData.title}</h1>${sectionData.text}`;
  } else {
    contentArea.innerHTML =
      "<h1>Section Not Found</h1><p>No content available.</p>";
  }

  // Highlight the active section in the sidebar
  const previousActive = document.querySelector(".sidebar ul li.active");
  if (previousActive) {
    previousActive.classList.remove("active");
  }
  document.getElementById(sectionId).classList.add("active");
}

function showCover() {
  const contentArea = document.querySelector(".content");
  contentArea.innerHTML = '<p class="cover-text"></p>';

  const fullText =
    "Hello, Crawler.<br><br>" +
    "As you’re about to find, this is a very special book.<br><br>" +
    "If you’re reading these words, it means this book has found its way into your hands for one purpose and one purpose only.<br><br>" +
    "Together, we will burn it all to the ground.";

  typeWriter(
    fullText,
    contentArea.querySelector(".cover-text"),
    false,
    showContinuePrompt
  );
}

function typeWriter(text, element, isSlow, callback) {
  let i = 0;
  let speed = isSlow ? 200 : 50; // Slower for 'Continue?' prompt

  (function type() {
    if (i < text.length) {
      if (text.substring(i, i + 4) === "<br>") {
        element.innerHTML += "<br>";
        i += 4;
      } else {
        element.innerHTML += text.charAt(i);
        i++;
      }
      setTimeout(type, speed);
    } else if (callback) {
      callback();
    }
  })();
}

function showContinuePrompt() {
  const contentArea = document.querySelector(".content");
  const continuePrompt = document.createElement("p");
  continuePrompt.classList.add("continue-prompt");
  contentArea.appendChild(continuePrompt);

  const promptText = "Wont You Join Us?<br>";
  typeWriter(promptText, continuePrompt, true, function () {
    // Create button container
    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    // Create 'Yes' button
    const yesButton = document.createElement("button");
    yesButton.innerText = "Yes";
    yesButton.classList.add("yes-button");
    yesButton.onclick = continueStory;

    // Create 'No' button
    const noButton = document.createElement("button");
    noButton.innerText = "No";
    noButton.classList.add("no-button");
    noButton.onclick = function () {
      alert("No was clicked.");
    };

    // Append buttons to the button container
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);

    // Append the button container to the content area
    contentArea.appendChild(buttonContainer);
  });
}

function continueStory() {
  const contentArea = document.querySelector(".content");
  contentArea.innerHTML = '<p class="cover-text"></p>';
  const cursorSpan = document.createElement("span");
  cursorSpan.classList.add("cursor");
  contentArea.querySelector(".cover-text").appendChild(cursorSpan);

  const additionalText =
    "The Dungeon Anarchist’s Cookbook<br>25th Edition<br><br>" +
    "Potions, Explosives, Traps, Secret Societies, Dungeon Shortcuts, and more. Much more. " +
    "This guide to creating chaos was originally generated into the system during the fifteenth season. " +
    "It was awarded to the High Elf Crawler Porthus the Rogue on the ninth floor, disguised as a blank sketchbook. " +
    "The fact you’re reading this indicates that this book and the knowledge within remains active in the code. " +
    "It has been passed down from dungeon to dungeon. It is automatically generated after a set of predetermined conditions have been met. " +
    "It will disappear from your inventory upon death or retirement where it will find its way to a worthy recipient in a future crawl.<br><br>" +
    "There is only one price for access to these pages. You must pass your own knowledge on. " +
    "In your messaging menu, you will find a scratchpad. If you’ve yet to discover this, it is a place to mentally write down recipes or thoughts or anything else you wish to recall. " +
    "If you look now, you will find you have been given one extra page into your scratchpad. Anything you add to this second page will be included in the 25th edition of this book.<br><br>" +
    "While the true contents of this guide are invisible to the showrunners and to the viewers, it is not invisible to the current System AI. " +
    "There is nothing about owning this book, or the information hidden within that is against the rules. However, if the organization running this season begins to suspect that this book is more than it appears, " +
    "or if you tell anyone about the existence of this book, the information within will erase, and you will forever lose access to the hidden text.<br><br>" +
    "This is important. While this book’s contents may be invisible, your actions are not. You must become an actor. " +
    "Every recipe, every secret, if utilized, must be presented to the outside world as if you are discovering this all on your own. How you do that is up to you. " +
    "Do not spend too much time staring at these pages.";

  typeWriter(additionalText, contentArea.querySelector(".cover-text"), false);
}

const sectionContent = {
  monsters: {
    title: "Monsters - Undead",
    text: `
            <p class="entry">A level 3 sapper’s table lets you infuse bombs. Soak a hobgoblin smoke curtain in a healing potion, let it dry, and it mass kills undead like you wouldn’t believe. <span class="author">&lt;Crawler Sinjin. 15th Edition&gt;</span></p>
            <p class="comment">Confirmed. Works with bombs too but smoke works better. Doesn’t kill high-level undead, but they get mad. I use these to clear rooms of those invisible Swamp Wights. <span class="author">&lt;Comment added by Crawler Forkith 20th Edition&gt;</span></p>
            <p class="entry">Vampires. We have vampires in my culture, but they are not the same as the ones here in the dungeon, though they are similar. My T’Ghee deck contains two vampiric forms. The Plague Bearer and the Blood Hunter. Both represent death. Both represent the end of days. But one is considered deliberate, thirst-based evil, and the other, the Plague Bearer, is a study on how one’s poor actions can ripple through time and become amplified and doom us all. The vampires here on this seventh floor are a combination of the two. It is strange that our traditions are so different yet the same. I have not met any fellow crawlers cursed with vampirism, but I have met my fair share of vampire mobs and NPCs. The monster ones cannot be reasoned with. They are fast. Faster than you think. They are insatiable. They are strong. Yet they are not mindless. In fact, I believe the curse of vampirism greatly increases their intelligence. They cast spells. They wish to surround themselves with protectors. Do not underestimate them. Do not rely solely on your own mythology to defeat them. My best advice is to avoid them, and if they’ve moved into an area you occupy, move away as quickly as you can. <span class="author">&lt;Note added by Crawler Allister. 13th Edition&gt;</span></p>`
  }
  // Additional sections as previously defined
};
