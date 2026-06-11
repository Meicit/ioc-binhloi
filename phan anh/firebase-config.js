// Sử dụng các dịch vụ lõi của Firebase SDK Modular qua CDN chính thức
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

// ĐỒNG BỘ: Thay thế các chuỗi ký tự dưới đây bằng thông số dự án của bạn
const firebaseConfig = {
    apiKey: "AIzaSyCjS8jJtoV5HLcYIpVTX1zP5DbyYmXsbh4",
    authDomain: "dashboard-demo-ce0da.firebaseapp.com",
    projectId: "dashboard-demo-ce0da",
    storageBucket: "dashboard-demo-ce0da.firebasestorage.app",
    messagingSenderId: "969593884637",
    appId: "1:969593884637:web:47d4e6b03a51e7dcfbb034"
};

// Khởi tạo thực thể ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo và Xuất (Export) các dịch vụ cơ sở dữ liệu để liên thông với app.js và lookup.js
export const db = getFirestore(app);
export const storage = getStorage(app);
