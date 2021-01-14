import firebase from "firebase";

const firebaseConfig = firebase.initializeApp({
  apiKey: "AIzaSyC8CMRXN7znmcxPnksjbhxhuQA0KG6mtsQ",
  authDomain: "chat-app-d7772.firebaseapp.com",
  databaseURL: "https://chat-app-d7772.firebaseio.com",
  projectId: "chat-app-d7772",
  storageBucket: "chat-app-d7772.appspot.com",
  messagingSenderId: "171418540279",
  appId: "1:171418540279:web:0c56b1475e9ec9b4a6dbf2",
  measurementId: "G-YB2FCKMFYL",
});

const db = firebaseConfig.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const storage = firebase.storage();

export { auth, provider, storage };
export default db;
