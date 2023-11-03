import firebase from "firebase-admin";

const firebaseConfig = {
  apiKey: "AIzaSyCR43VTwx11WjV95PiBf6HJMIayXxrh7zY",
  authDomain: "crackit-d3bfb.firebaseapp.com",
  projectId: "crackit-d3bfb",
  storageBucket: "crackit-d3bfb.appspot.com",
  messagingSenderId: "767742891503",
  appId: "1:767742891503:web:526c1e6910092ac33ad21a",
  measurementId: "G-W2XG2EHR99"
};

firebase.initializeApp({
  credential: firebase.credential.cert(firebaseConfig),
});

module.exports = { firebase };
