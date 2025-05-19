// ==================== TAB SİSTEMİ (Varsayılıyor) ====================
class TabSystem {
    constructor() {
        this.tabs = document.querySelectorAll('.tab-button');
        this.pages = {
            home: document.getElementById('homePage'),
            earn: document.getElementById('earnPage'),
            frens: document.getElementById('frensPage'),
            leaderboard: document.getElementById('leaderboardPage'),
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
            if (page) { // Sayfa elementinin varlığını kontrol et
                page.classList.remove('active');
                page.style.display = 'none';
            }
        });
        if (this.pages[pageId]) { // Hedef sayfa elementinin varlığını kontrol et
            this.pages[pageId].classList.add('active');
            this.pages[pageId].style.display = 'flex';
            this.tabs.forEach(tab => {
                tab.disabled = (tab.id.replace('Btn', '').toLowerCase() === pageId);
            });
            if (pageId === 'earn') {
                // Earn sayfası aktif olduğunda quest ve earn seçeneklerini göster (CSS ile yapılıyor)
            }
        } else {
            console.error("Sayfa bulunamadı:", pageId);
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
        this.cooldownBadge = document.querySelector('#miningContainer .cooldown-badge');
        // this.dailyBonusElement = document.querySelector('#homePage > div:last-child'); // Bu satır artık kullanılmıyor, bonus sistemi kendi elementlerini yönetecek
                                                                                      // Eğer başka bir amaçla kullanılıyorsa ve gerekliyse, ID'sini kontrol edin.
                                                                                      // Şimdilik yoruma alıyorum.

        this.init();
    }

    init() {
        if (!this.farmBtn) {
            console.error("Farm butonu bulunamadı!");
            // return; // Farm butonu yoksa bile diğer sistemler çalışsın diye return'ü kaldırabiliriz veya hata yönetimini farklı yapabiliriz.
        } else {
            this.farmBtn.addEventListener('click', () => this.handleClick());
        }

        this.updateUI(); // Başlangıçta UI'ı hemen güncelle
        setInterval(() => this.updateUI(), 1000); // Her saniye UI güncellemesi

        if (this.isVIPActive() && localStorage.getItem('vip_cooldown')) {
            this.cooldown = parseInt(localStorage.getItem('vip_cooldown'));
        }

        // this.showDailyBonus(); // Bu metodun ne yaptığına bağlı olarak kaldırılabilir veya günlük bonus sistemine entegre edilebilir.
                                // Eğer bu, sadece dailyBonusContainer'ı gösteriyorsa, artık gereksiz olabilir.
                                // Şimdilik yoruma alıyorum.
    }

    handleClick() {
        if (this.isProcessing || !this.farmBtn || this.farmBtn.disabled) return; // farmBtn varlığını ve disabled durumunu kontrol et
        this.isProcessing = true;
        this.farmBtn.classList.add('inactive'); 
        this.farmBtn.innerHTML = 'Farm ⛏️'; 

        try {
            this.handleMining();
        } catch (e) {
            console.error("Mining hatası:", e);
        } finally {
            setTimeout(() => {
                this.isProcessing = false;
                this.updateButtonTextAndState(); 
                if (this.farmBtn) this.farmBtn.classList.remove('inactive');
            }, 1000);
        }
    }

    handleMining() {
        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        const remaining = this.cooldown - (Date.now() - lastFarm);

        if (remaining <= 0) {
            const coinsToAdd = this.isVIPActive() ? 200 : 100;
            this.addCoins(coinsToAdd);
            localStorage.setItem('lastFarmTime', Date.now().toString()); // Zaman damgasını string olarak kaydetmek daha güvenli olabilir

            this.triggerAnimations();
            this.showMessage(coinsToAdd);
            // this.hideDailyBonus(); // Bu metodun ne yaptığına bağlı. Eğer dailyBonusContainer'ı gizliyorsa,
                                   // ve mining sonrası gizlenmesi isteniyorsa kalabilir. Şimdilik yoruma alıyorum.
        }
        this.updateUI(); // Her zaman UI'ı güncelle
    }

    triggerAnimations() {
        if (!this.farmBtn) return;
        this.farmBtn.classList.add('vibrate');
        setTimeout(() => this.farmBtn.classList.remove('vibrate'), 300);

        // Mining particles efekti için farmBtn var olmalı
        const particles = document.createElement('div');
        particles.className = 'mining-particles';
        this.farmBtn.appendChild(particles);
        setTimeout(() => particles.remove(), 1000);
    }

    showMessage(coins) {
        if (!this.message) return;
        this.message.textContent = this.isVIPActive()
            ? `✨ VIP Bonus! +${coins} MPET`
            : `⛏️ Mined ${coins} MPET`;
    }

    isVIPActive() {
        const expiry = localStorage.getItem('vip_expiry');
        return expiry && Date.now() < parseInt(expiry);
    }

    addCoins(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            console.error("addCoins: Eklenecek miktar geçerli bir sayı değil!", amount);
            return;
        }
        const current = parseInt(localStorage.getItem('coins')) || 0;
        localStorage.setItem('coins', (current + amount).toString());
        this.updateCoinDisplay(); 
    }

    updateCoinDisplay() {
        if (!this.coinDisplay) return;
        const coins = parseInt(localStorage.getItem('coins')) || 0;
        this.coinDisplay.textContent = `MPET: ${coins}`;
    }

    updateUI() {
        this.updateCoinDisplay();
        if (!this.farmBtn || !this.cooldownBadge) return; // Elementler yoksa devam etme

        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        let remaining = this.cooldown - (Date.now() - lastFarm);
        if (remaining < 0) remaining = 0; // Kalan süre negatif olmasın

        this.updateButtonTextAndState(remaining);
    }

    updateButtonTextAndState(remaining) {
         if (!this.farmBtn || !this.cooldownBadge) return;

        if (remaining <= 0) {
            this.farmBtn.disabled = false;
            this.farmBtn.innerHTML = 'Farm <i class="fas fa-hammer"></i>'; 
            this.cooldownBadge.textContent = 'READY';
        } else {
            this.farmBtn.disabled = true;
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            const timeString = `⌛ ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
            this.farmBtn.innerHTML = 'Farm <i class="fas fa-hammer"></i>'; 
            this.cooldownBadge.textContent = timeString;
        }
    }

    // Bu fonksiyonlar artık günlük bonus sistemi tarafından yönetilecek, MiningSystem içinden kaldırılabilir
    // veya farklı bir amaçları varsa korunabilir. Şimdilik yoruma alıyorum.
    /*
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
    */
}

// ==================== GÜNLÜK GİRİŞ BONUSU SİSTEMİ ====================
const DAILY_BONUS_REWARD_MPET = 50; // Günlük bonus MPET miktarı
const LOCAL_STORAGE_LAST_CLAIM_KEY = 'petMiner_lastDailyBonusClaimTime';

let claimDailyBonusBtnEl = null; // Elementleri global veya kapsayıcı bir scope'ta tutalım
let dailyBonusMessageEl = null;

function initDailyBonusSystem() {
    claimDailyBonusBtnEl = document.getElementById('claimDailyBonusBtn');
    dailyBonusMessageEl = document.getElementById('dailyBonusMessage');

    if (!claimDailyBonusBtnEl || !dailyBonusMessageEl) {
        console.warn("Günlük bonus HTML elementleri (#claimDailyBonusBtn veya #dailyBonusMessage) bulunamadı. Bu özellik çalışmayacak.");
        return;
    }

    checkDailyBonusStatus(); 

    claimDailyBonusBtnEl.addEventListener('click', handleClaimDailyBonus);
    console.log("Günlük Giriş Bonusu sistemi başlatıldı.");
}

function checkDailyBonusStatus() {
    if (!claimDailyBonusBtnEl || !dailyBonusMessageEl) return; // Elementler yoksa devam etme

    const lastClaimTimestamp = localStorage.getItem(LOCAL_STORAGE_LAST_CLAIM_KEY);
    const now = new Date();
    const todayDateString = now.toDateString(); 

    claimDailyBonusBtnEl.disabled = true; 

    if (!lastClaimTimestamp) {
        claimDailyBonusBtnEl.textContent = `Claim Daily Bonus! (+${DAILY_BONUS_REWARD_MPET} MPET)`;
        claimDailyBonusBtnEl.disabled = false;
        dailyBonusMessageEl.textContent = "Welcome! Claim your first daily bonus.";
    } else {
        const lastClaimDate = new Date(parseInt(lastClaimTimestamp));
        const lastClaimDateString = lastClaimDate.toDateString();

        if (lastClaimDateString === todayDateString) {
            claimDailyBonusBtnEl.textContent = "Bonus Claimed Today";
            dailyBonusMessageEl.textContent = "Come back tomorrow for your next bonus!";
        } else {
            claimDailyBonusBtnEl.textContent = `Claim Daily Bonus! (+${DAILY_BONUS_REWARD_MPET} MPET)`;
            claimDailyBonusBtnEl.disabled = false;
            dailyBonusMessageEl.textContent = "Your daily bonus is ready!";
        }
    }
}

function handleClaimDailyBonus() {
    if (!claimDailyBonusBtnEl || !dailyBonusMessageEl || claimDailyBonusBtnEl.disabled) return;

    if (typeof window.addCoins === 'function') {
        window.addCoins(DAILY_BONUS_REWARD_MPET);
        localStorage.setItem(LOCAL_STORAGE_LAST_CLAIM_KEY, Date.now().toString());

        claimDailyBonusBtnEl.textContent = "Bonus Claimed!";
        claimDailyBonusBtnEl.disabled = true; // Butonu hemen devre dışı bırak
        dailyBonusMessageEl.textContent = `You received ${DAILY_BONUS_REWARD_MPET} MPET! Come back tomorrow.`;
        
        // Arayüzü hemen güncellemek yerine checkDailyBonusStatus'u çağırabiliriz
        // Bu, "Come back tomorrow" mesajını ve gerekirse kalan süreyi hemen gösterir.
        setTimeout(() => {
             checkDailyBonusStatus(); 
        }, 1500); // Kullanıcının "Bonus Claimed!" mesajını görmesi için kısa bir gecikme

    } else {
        console.error("addCoins fonksiyonu bulunamadı! Günlük bonus verilemedi.");
        dailyBonusMessageEl.textContent = "Error claiming bonus. Please try again later.";
    }
}


// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
    new TabSystem();
    initFriendSystem(); // Arkadaş sistemini başlat
    
    const miningSystem = new MiningSystem();
    // window.addCoins'i MiningSystem örneği oluşturulduktan sonra tanımla
    if (miningSystem && typeof miningSystem.addCoins === 'function') {
        window.addCoins = miningSystem.addCoins.bind(miningSystem);
    } else {
        console.error("MiningSystem veya addCoins metodu düzgün başlatılamadı!");
        // Fallback veya dummy addCoins fonksiyonu, diğer sistemlerin çökmemesi için
        window.addCoins = (amount) => {
            console.warn(`addCoins çağrıldı (${amount}), ancak MiningSystem düzgün yüklenmedi.`);
        };
    }

    initDailyBonusSystem(); // Günlük bonus sistemini BAŞLAT

    // initInviteButton ve initVIPButton fonksiyonlarınızın tanımlı olduğundan emin olun
    // Eğer tanımlı değillerse ve çağrılıyorlarsa hata alırsınız.
    // Şimdilik, eğer tanımlı değillerse hata vermemesi için kontrol ekleyebiliriz:
    if (typeof initInviteButton === 'function') {
        initInviteButton();
    }
    if (typeof initVIPButton === 'function') {
        initVIPButton();
    }

    if (window.Telegram?.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
    }
    console.log("Uygulama başlatıldı ve tüm sistemler yüklendi.");
});

// Eğer initInviteButton ve initVIPButton fonksiyonları henüz tanımlanmadıysa,
// ve bu dosyanın başka bir yerinde değillerse, ya tanımlamanız ya da çağrılarını kaldırmanız gerekir.
// Örnek boş fonksiyonlar (hata vermemesi için):
/*
function initInviteButton() {
    console.log("initInviteButton çağrıldı (tanımlanmamış olabilir).");
}
function initVIPButton() {
    console.log("initVIPButton çağrıldı (tanımlanmamış olabilir).");
}
*/