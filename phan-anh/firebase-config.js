import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCjS8jJtoV5HLcYIpVTX1zP5DbyYmXsbh4",
    authDomain: "dashboard-demo-ce0da.firebaseapp.com",
    databaseURL: "https://dashboard-demo-ce0da-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "dashboard-demo-ce0da",
    messagingSenderId: "969593884637",
    appId: "1:969593884637:web:47d4e6b03a51e7dcfbb034",
    measurementId: "G-EVMDSWWRFG"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
