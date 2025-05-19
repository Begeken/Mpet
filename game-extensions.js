// ==================== DAILY BONUS SYSTEM ====================
function checkDailyBonus() {
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('lastBonusDate');

    if (lastBonus !== today) {
        // Coin ekle (index.js'deki MiningSystem örneği üzerinden)
        if (window.addCoins) {
            window.addCoins(50);
        } else {
            console.error("addCoins fonksiyonu tanımlı değil!");
        }

        localStorage.setItem('lastBonusDate', today);
        showBonusMessage();
    }
}

// Bonus mesajını göster
function showBonusMessage() {
    const msgElement = document.getElementById('message');
    if (msgElement) {
        msgElement.textContent = "🎁 Daily Bonus: 50 MPET!";
        msgElement.classList.add('pulse-effect');
        setTimeout(() => msgElement.classList.remove('pulse-effect'), 3000);
    }
}

// ==================== MADENCİLİK ANİMASYONU (index.js'e taşındı) ====================
// Bu fonksiyonellik MiningSystem sınıfı içinde ele alınıyor.

// Uygulamayı başlat
document.addEventListener('DOMContentLoaded', () => {
    checkDailyBonus();
    // Madencilik animasyonu index.js içinde başlatılıyor.
});

// VIP Durum Kontrolü (social.js'de de var, burada tutulmasına gerek yok)
