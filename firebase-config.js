// firebase-config.js

const firebaseConfig = {
    apiKey: "AIzaSyCT4p4jTIvEA7oFPC2yX-B66678GA6Fgjc",
    authDomain: "havocrpg-38997.firebaseapp.com",
    projectId: "havocrpg-38997",
    storageBucket: "havocrpg-38997.appspot.com",
    messagingSenderId: "206422450636",
    appId: "1:206422450636:web:3d8b3a014ade132be47d69",
    measurementId: "G-20MRE80PDP"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database(); 