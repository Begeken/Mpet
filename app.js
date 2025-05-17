// ==================== GÜNLÜK GÖREV SİSTEMİ ====================
const dailyQuests = {
  currentDate: new Date().toLocaleDateString(),
  completed: false,
  mineCount: 0,

  init() {
    const saved = JSON.parse(localStorage.getItem('dailyQuests')) || {};
    if (saved.currentDate !== this.currentDate) {
      this.reset();
    } else {
      Object.assign(this, saved);
    }
    return this;
  },

  reset() {
    this.completed = false;
    this.mineCount = 0;
    this.save();
  },

  addMine() {
    if (this.completed) return;
    
    this.mineCount++;
    if (this.mineCount >= 3) {
      this.complete();
    }
    this.save();
  },

  complete() {
    this.completed = true;
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.showAlert("🎉 Günlük görev tamamlandı! +25 MPET kazandınız!");
    }
    addCoins(25); // MPET ekleme fonksiyonunuz
    this.save();
  },

  save() {
    localStorage.setItem('dailyQuests', JSON.stringify(this));
  }
};
// =============== TELEGRAM WEB APP START ===============
if (!window.Telegram?.WebApp) {
  // Not running inside Telegram WebApp
  console.warn("Running outside Telegram WebApp");
} else {
  const tgWebApp = Telegram.WebApp;
  tgWebApp.ready();
  tgWebApp.expand();

  // 1. SCROLL KONTROL SİSTEMİ
  // Viewport ayarı
  const existingViewport = document.querySelector('meta[name="viewport"]');
  if (!existingViewport) {
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    document.head.appendChild(meta);
  }

  // CSS ile scroll'u tamamen engelleme
  const scrollLockStyles = document.createElement('style');
  scrollLockStyles.textContent = `
    html, body, #root {
      height: 100% !important;
      width: 100% !important;
      overflow: hidden !important;
      position: fixed !important;
      overscroll-behavior: none !important;
    }
    
    @supports (-webkit-touch-callout: none) {
      body {
        -webkit-overflow-scrolling: none !important;
      }
    }
  `;
  document.head.appendChild(scrollLockStyles);

  // Touch event kontrolü
  const handleTouchMove = (e) => {
    const allowedElements = ['scroll-allowed', 'tg-input'];
    if (!allowedElements.some(className => e.target.classList.contains(className))) {
      e.preventDefault();
    }
  };
  document.addEventListener('touchmove', handleTouchMove, { passive: false });

  // 2. TEMALAR ve KULLANICI AYARLARI
  const tgUser = tgWebApp.initDataUnsafe.user;
  const tgTheme = tgWebApp.colorScheme;

  document.documentElement.classList.toggle('dark-mode', tgTheme === 'dark');

  if (!tgUser) {
    tgWebApp.showAlert("Please log in via Telegram!");
    tgWebApp.close();
  }

  tgWebApp.BackButton.onClick(() => {
    showPage('home');
    tgWebApp.BackButton.hide();
  });

  tgWebApp.MainButton.setParams({
    text: "PLAY PETMINER",
    color: "#33cccc",
    text_color: "#0a0f1a",
    is_visible: true,
    is_active: true
  }).onClick(() => {
    window.open("https://begeken.github.io/Mpet/", "_blank");
  });

  function sendTelegramData(data) {
    fetch('http://localhost:3000/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: tgUser.id,
        ...data
      })
    })
    .then(res => res.json())
    .then(res => console.log('Backend response:', res))
    .catch(err => console.error('Backend error:', err));
  }

  let coins = localStorage.getItem('petCoins') || 0;
  const COOLDOWN = 1000 * 60 * 60 * 8; // 8 hours

  function mineCoins() {
    if (Telegram?.WebApp && Telegram.WebApp.initDataUnsafe.user) {
      const newCoins = Number(coins) + 10;
      dailyQuests.init().addMine();
      sendTelegramData({
        action: "mine",
        coins: newCoins,
        timestamp: Date.now()
      });

      if (window.navigator.vibrate) navigator.vibrate([50, 30, 50]);
    }

    updateUI();
  }

  function updateUI() {
    if (Telegram?.WebApp) {
      Telegram.WebApp.MainButton.setParams({
        is_visible: coins > 100,
        is_active: coins > 100
  const quest = dailyQuests.init();
  document.getElementById('quest-display').textContent = 
  `Günlük Görev: ${quest.mineCount}/3 Madencilik`;
      });
    }
  }

  function setupShareButton() {
    if (Telegram?.WebApp) {
      const shareBtn = document.createElement('button');
      shareBtn.className = 'tg-share-btn';
      shareBtn.innerHTML = '<i class="fas fa-share"></i> Invite a Friend';
      shareBtn.onclick = () => {
        Telegram.WebApp.shareLink(
          `https://t.me/${Telegram.WebApp.initDataUnsafe.user.username}?startapp=petminer`,
          { title: "Join PetMiner!" }
        );
      };
      document.querySelector('nav')?.appendChild(shareBtn);
    }
  }

  // Nükleer scroll engelleme (iOS için ekstra koruma)
  const forceScrollLock = () => {
    document.querySelectorAll('*').forEach(el => {
      el.style.overflow = 'hidden';
      el.style.touchAction = 'none';
    });
  };
  
  // İlk çalıştırma ve her 5 saniyede bir kontrol
  forceScrollLock();
  const scrollLockInterval = setInterval(forceScrollLock, 5000);

  // Cleanup fonksiyonu
  window.addEventListener('beforeunload', () => {
    clearInterval(scrollLockInterval);
    document.removeEventListener('touchmove', handleTouchMove);
  });

  if (Telegram?.WebApp) {
    setupShareButton();
    updateUI();
  }
}
// =============== TELEGRAM WEB APP END ===============
