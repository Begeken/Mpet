// ==================== DAILY BONUS SYSTEM ====================
function checkDailyBonus() {
  const today = new Date().toDateString();
  const lastBonus = localStorage.getItem('lastBonusDate');
  
  if (lastBonus !== today) {
    // Add coins (uses function from app.js)
    if (window.addCoins) {
      window.addCoins(50);
    } else {
      console.error("addCoins function is not defined!");
    }
    
    localStorage.setItem('lastBonusDate', today);
    showBonusMessage();
  }
}

// Show bonus message
function showBonusMessage() {
  const msgElement = document.getElementById('message');
  if (msgElement) {
    msgElement.textContent = "🎁 Daily Bonus: 50 Coins!";
    msgElement.classList.add('pulse-effect');
    setTimeout(() => msgElement.classList.remove('pulse-effect'), 3000);
  }
}

// ==================== MINING ANIMATION ====================
function initMiningAnimation() {
  const farmBtn = document.getElementById('farmButton');
  if (!farmBtn) return;
  
  farmBtn.addEventListener('click', function() {
    // Vibration effect
    this.classList.add('vibrate');
    setTimeout(() => this.classList.remove('vibrate'), 300);
    
    // Particle effect (with CSS)
    const particles = document.createElement('div');
    particles.className = 'mining-particles';
    this.appendChild(particles);
    setTimeout(() => particles.remove(), 1000);
  });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  checkDailyBonus();
  initMiningAnimation();
});
