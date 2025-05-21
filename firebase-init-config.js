// public/firebase-init-config.js

// SDK'lardan ihtiyacınız olan fonksiyonları import edin
// Kullandığınız Firebase SDK versiyonunu (örn: 11.8.0) kendi projenizdekiyle eşleştirin
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-firestore.js";
// Gelecekte Firebase Authentication, Storage gibi servisleri kullanırsanız,
// onların da importlarını buraya eklersiniz:
// import { getAuth } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
// import { getStorage } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-storage.js";

// Web uygulamanızın Firebase yapılandırması (SİZİN GERÇEK BİLGİLERİNİZ)
const firebaseConfig = {
  apiKey: "AIzaSyCScccDP33DoV_6bTTWgEC4w4BOlulwyKk", // Bu sizin gerçek API key'iniz
  authDomain: "petminer-2dc28.firebaseapp.com",      // Bu sizin gerçek authDomain'iniz
  projectId: "petminer-2dc28",                      // Bu sizin gerçek projectId'niz
  storageBucket: "petminer-2dc28.firebasestorage.app",// Bu sizin gerçek storageBucket'ınız
  messagingSenderId: "886118506648",                 // Bu sizin gerçek messagingSenderId'niz
  appId: "1:886118506648:web:356c9205ec3e6503cdb0ed" // Bu sizin gerçek appId'niz
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const auth = getAuth(app); // Örnek: Eğer Auth kullanacaksanız
// const storage = getStorage(app); // Örnek: Eğer Storage kullanacaksanız

// Diğer scriptlerinizin db ve app objelerine erişebilmesi için global window objesine atayalım
window.firebaseApp = app; // İhtiyaç duyarsanız 'app' objesi için
window.db = db;          // Firestore veritabanı için
// window.auth = auth; // Örnek
// window.storage = storage; // Örnek

console.log("Firebase initialized from firebase-init-config.js. 'window.db' and 'window.firebaseApp' are set.");