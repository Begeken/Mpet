// =============== TELEGRAM WEB APP BAŞLANGIÇ ===============
// Telegram API kontrolü
if (!window.Telegram?.WebApp) {
} else {
  // Telegram WebApp'i başlat
  const tgWebApp = Telegram.WebApp;
  tgWebApp.ready();
  tgWebApp.expand(); // Tam ekran yap
  
  // Kullanıcı bilgilerini al
  const tgUser = tgWebApp.initDataUnsafe.user;
  const tgTheme = tgWebApp.colorScheme;
  
  // Tema uyumunu ayarla
  document.documentElement.classList.toggle('dark-mode', tgTheme === 'dark');
  
  // Kullanıcı giriş kontrolü
  if (!tgUser) {
    tgWebApp.showAlert("Lütfen Telegram'dan giriş yapın!");
    tgWebApp.close();
  }

  // =============== TELEGRAM ÖZEL FONKSİYONLAR ===============
  // Geri butonu kontrolü
  tgWebApp.BackButton.onClick(() => {
    showPage('home');
    tgWebApp.BackButton.hide();
  });
  
  // Ana buton ayarı
  tgWebApp.MainButton.setParams({
    text: "BANKA YATIR",
    color: "#33cccc",
    text_color: "#0a0f1a"
  }).onClick(() => {
    tgWebApp.showPopup({
      title: "Banka İşlemi",
      message: "MPET coinlerinizi yatırmak istiyor musunuz?",
      buttons: [{
        id: "deposit",
        type: "default",
        text: "Onayla"
      }]
    });
  });

  // =============== VERİ GÖNDERME ÖRNEĞİ ===============
function sendTelegramData(data) {
  fetch('http://localhost:3000/api/telegram', {  // Backend adresin
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: tgUser.id,
      ...data
    })
  })
  .then(res => res.json())
  .then(res => console.log('Backend cevabı:', res))
  .catch(err => console.error('Backend hatası:', err));
}

// =============== UYGULAMA MANTIĞI (DEVAM) ===============
let coins = localStorage.getItem('petCoins') || 0;
const COOLDOWN = 1000 * 60 * 60 * 8; // 8 saat

// Madencilik fonksiyonu (Telegram uyumlu)
function mineCoins() {
  if (Telegram?.WebApp && Telegram.WebApp.initDataUnsafe.user) {
    const newCoins = coins + 10;
    
    // Telegram'a veri gönder
    sendTelegramData({
      action: "mine",
      coins: newCoins,
      timestamp: Date.now()
    });
    
    // Haptic feedback (Titreşim)
    if (window.navigator.vibrate) navigator.vibrate([50, 30, 50]);
  }
  
  // UI güncelleme
  updateUI();
}

// =============== TELEGRAM SPESİFİK UI ===============
function updateUI() {
  // Telegram'da MainButton durumunu ayarla
  if (Telegram?.WebApp) {
    Telegram.WebApp.MainButton.setParams({
      is_visible: coins > 100,
      is_active: coins > 100
    });
  }
  
  // Diğer UI güncellemeleri...
}

// =============== TELEGRAM PAYLAŞIM BUTONU ===============
function setupShareButton() {
  if (Telegram?.WebApp) {
    const shareBtn = document.createElement('button');
    shareBtn.innerHTML = '<i class="fas fa-share"></i> Arkadaşını Davet Et';
    shareBtn.onclick = () => {
      Telegram.WebApp.shareLink(
        `https://t.me/${Telegram.WebApp.initDataUnsafe.user.username}?startapp=petminer`,
        { title: "PetMiner'a Katıl!" }
      );
    };
    document.querySelector('nav').appendChild(shareBtn);
  }
}

// Uygulama başlangıcı
if (Telegram?.WebApp) {
  setupShareButton();
  updateUI();
} else {
  console.warn("Telegram dışında çalışıyor");
}
