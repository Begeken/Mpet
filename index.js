// ==================== TAB SİSTEMİ (Varsayılıyor) ====================
class TabSystem {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.pages = {
            home: document.getElementById('homePage'),
            earn: document.getElementById('earnPage'),
            frens: document.getElementById('frensPage'),
            wallet: document.getElementById('walletPage')
        };
        this.init();
    }

    init() {
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => this.showPage(tab.id.replace('Btn', '').toLowerCase()));
        });
        this.showPage('home'); // Başlangıç sayfası
    }

    showPage(pageId) {
        Object.values(this.pages).forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
        this.pages[pageId].classList.add('active');
        this.pages[pageId].style.display = 'flex';
this.tabs.forEach(tab => {
            tab.disabled = (tab.id.replace('Btn', '').toLowerCase() === pageId);
        });
        if (pageId === 'earn') {
            // Earn sayfası aktif olduğunda quest ve earn seçeneklerini göster (CSS ile yapılıyor)
        }
    }
}

// ==================== ARKADAŞ SİSTEMİ (Varsayılıyor) ====================
function initFriendSystem() {
    // Arkadaş sistemi ile ilgili işlevler buraya gelecek
    console.log("Arkadaş sistemi başlatıldı.");
}

// ==================== ENTEGRE MINING SISTEMI ====================
class MiningSystem {
    constructor() {
        this.cooldown = 8 * 60 * 60 * 1000; // 8 saat (default)
        this.coinDisplay = document.getElementById('coinDisplay');
        this.farmBtn = document.getElementById('farmButton');
        this.message = document.getElementById('message');
        this.isProcessing = false;
        this.cooldownBadge = document.querySelector('#miningContainer .cooldown-badge'); // Doğru badge elementini seç
        this.dailyBonusElement = document.querySelector('#homePage > div:last-child'); // Daily Bonus elementini seç

        this.init();
    }

    init() {
        if (!this.farmBtn) {
            console.error("Farm butonu bulunamadı!");
            return;
        }

        this.farmBtn.addEventListener('click', () => this.handleClick());
        this.updateUI();
        setInterval(() => this.updateUI(), 60000);

        // VIP cooldown'unu kontrol et
        if (this.isVIPActive() && localStorage.getItem('vip_cooldown')) {
            this.cooldown = parseInt(localStorage.getItem('vip_cooldown'));
        }

        // Daily bonus yazısını başlangıçta göster
        this.showDailyBonus();
    }

    handleClick() {
        if (this.isProcessing) return;
        this.isProcessing = true;
        this.farmBtn.classList.add('inactive'); // Butona 'inactive' class'ını ekle (kararma için)
        this.farmBtn.innerHTML = 'Farm ⛏️'; // Buton metnini değiştir

        try {
            this.handleMining();
        } catch (e) {
            console.error("Mining hatası:", e);
        } finally {
            setTimeout(() => {
                this.isProcessing = false;
                this.updateButtonTextAndState(); // Buton metnini ve durumunu güncelle
                this.farmBtn.classList.remove('inactive'); // İşlem bitince 'inactive' class'ını kaldır
            }, 1000);
        }
    }

    handleMining() {
        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        const remaining = this.cooldown - (Date.now() - lastFarm);

        if (remaining <= 0) {
            const coinsToAdd = this.isVIPActive() ? 200 : 100;
            this.addCoins(coinsToAdd);
            localStorage.setItem('lastFarmTime', Date.now());

            this.triggerAnimations();
            this.showMessage(coinsToAdd);
            this.hideDailyBonus(); // Mining yapıldığında daily bonus yazısını kaldır
        }

        this.updateUI();
    }

    triggerAnimations() {
        this.farmBtn.classList.add('vibrate');
        setTimeout(() => this.farmBtn.classList.remove('vibrate'), 300);

        const particles = document.createElement('div');
        particles.className = 'mining-particles';
        this.farmBtn.appendChild(particles);
        setTimeout(() => particles.remove(), 1000);
    }

    showMessage(coins) {
        this.message.textContent = this.isVIPActive()
            ? `✨ VIP Bonus! +${coins} MPET`
            : `⛏️ Mined ${coins} MPET`;
    }

    isVIPActive() {
        const expiry = localStorage.getItem('vip_expiry');
        return expiry && Date.now() < parseInt(expiry);
    }

    addCoins(amount) {
        const current = parseInt(localStorage.getItem('coins')) || 0;
        localStorage.setItem('coins', current + amount);
        this.updateCoinDisplay(); // Coin göstergesini anında güncelle
    }

    updateCoinDisplay() {
        const coins = parseInt(localStorage.getItem('coins')) || 0;
        this.coinDisplay.textContent = `MPET: ${coins}`;
    }

    updateUI() {
        this.updateCoinDisplay();
        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        const remaining = this.cooldown - (Date.now() - lastFarm);

        this.updateButtonTextAndState(remaining);
    }

    updateButtonTextAndState(remaining = this.cooldown - (parseInt(localStorage.getItem('lastFarmTime')) || 0)) {
        if (remaining <= 0) {
            this.farmBtn.disabled = false;
            this.farmBtn.innerHTML = 'Farm <i class="fas fa-hammer"></i>'; // İkonu geri ekledim
            this.cooldownBadge.textContent = 'READY';
        } else {
            this.farmBtn.disabled = true;
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            const timeString = `⌛ ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
            this.farmBtn.innerHTML = 'Farm <i class="fas fa-hammer"></i>'; // Cooldown sürerken de ikonu korudum
            this.cooldownBadge.textContent = timeString;
        }
    }

    showDailyBonus() {
        if (this.dailyBonusElement) {
            this.dailyBonusElement.style.display = 'block';
        }
    }

    hideDailyBonus() {
        if (this.dailyBonusElement) {
            this.dailyBonusElement.style.display = 'none';
        }
    }
}

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
    new TabSystem();
    initFriendSystem();
    const miningSystem = new MiningSystem();
    window.addCoins = miningSystem.addCoins.bind(miningSystem); // 'this' bağlamını kor

    initInviteButton();
    initVIPButton();

    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
});

// Eğer VIP butonu işlevselliğiniz varsa bu fonksiyonu tanımlayın:
// function initVIPButton() {
//     const vipButton = document.getElementById('vipButtonId'); // Gerçek ID'nizi buraya yazın
//     if (vipButton) {
//         vipButton.addEventListener('click', () => {
//             // VIP satın alma veya etkinleştirme mantığınızı buraya ekleyin
//             const vipDuration = 24 * 60 * 60 * 1000; // Örneğin 24 saat
//             localStorage.setItem('vip_expiry', Date.now() + vipDuration);
//             localStorage.setItem('vip_cooldown', 4 * 60 * 60 * 1000); // VIP için 4 saat cooldown
//             miningSystem.cooldown = 4 * 60 * 60 * 1000;
//             miningSystem.updateUI();
//             console.log("VIP activated!");
//         });
//         // VIP durumunu kontrol edip butonu buna göre güncelleyebilirsiniz
//         if (localStorage.getItem('vip_expiry') && Date.now() < parseInt(localStorage.getItem('vip_expiry'))) {
//             vipButton.textContent = 'VIP Active';
//             vipButton.disabled = true;
//         }
//     }
// }
