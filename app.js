// =============== TELEGRAM WEB APP START ===============
if (!window.Telegram?.WebApp) {
  // Not running inside Telegram WebApp
} else {
  const tgWebApp = Telegram.WebApp;
  tgWebApp.ready();
  tgWebApp.expand();

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
      });
    }
  }

  function setupShareButton() {
    if (Telegram?.WebApp) {
      const shareBtn = document.createElement('button');
      shareBtn.innerHTML = '<i class="fas fa-share"></i> Invite a Friend';
      shareBtn.onclick = () => {
        Telegram.WebApp.shareLink(
          `https://t.me/${Telegram.WebApp.initDataUnsafe.user.username}?startapp=petminer`,
          { title: "Join PetMiner!" }
        );
      };
      document.querySelector('nav').appendChild(shareBtn);
    }
  }

  if (Telegram?.WebApp) {
    setupShareButton();
    updateUI();
  } else {
    console.warn("Running outside Telegram");
  }
}
