// ==================== TELEGRAM WEB APP INTEGRATION ====================
if (window.Telegram?.WebApp) {
  // 1. Initialize Telegram interface
  Telegram.WebApp.ready();
  Telegram.WebApp.expand();
  
  // 2. Theme control (dark/light)
  document.documentElement.classList.toggle(
    'dark-mode', 
    Telegram.WebApp.colorScheme === 'dark'
  );
  
  // 3. Back button control
  Telegram.WebApp.BackButton.onClick(() => {
    showPage('home'); // Page switch function
    Telegram.WebApp.BackButton.hide();
  });
}

// ==================== COIN SYSTEM ====================
let coins = localStorage.getItem('petCoins') || 0;
const COOLDOWN = 1000 * 60 * 60 * 8; // 8-hour cooldown

// Coin mining function
function mineCoins() {
  const lastMine = localStorage.getItem('lastMine') || 0;
  const now = Date.now();
  
  if (now - lastMine >= COOLDOWN) {
    coins += 100;
    localStorage.setItem('petCoins', coins);
    localStorage.setItem('lastMine', now);
    updateUI();
    
    // Telegram alert
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.showAlert("⛏️ You earned +100 Coins!");
    }
  } else {
    const remaining = COOLDOWN - (now - lastMine);
    alert(`⏳ Wait ${Math.floor(remaining / 3600000)} more hours to mine again!`);
  }
}

// Update UI
function updateUI() {
  document.getElementById('coinDisplay').textContent = `Coins: ${coins}`;
  
  // Button state
  const farmBtn = document.getElementById('farmButton');
  if (farmBtn) {
    farmBtn.disabled = (Date.now() - localStorage.getItem('lastMine')) < COOLDOWN;
  }
}

// Page switching
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(`${pageId}Page`).classList.add('active');
}

// Start app
document.addEventListener('DOMContentLoaded', () => {
  updateUI();
  
  // Farm button event
  document.getElementById('farmButton')?.addEventListener('click', mineCoins);
});
