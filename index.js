// index.js

// ==================== FIREBASE VERİ KAYDETME FONKSİYONU ====================
async function savePlayerData(userId, dataToSave) {
  if (!userId) {
    console.error("Hata: Oyuncu ID'si (userId) olmadan veri kaydedilemez!");
    alert("Hata: Oyuncu kimliği alınamadı.");
    return;
  }
  if (!window.db) { 
    console.error("Hata: Firestore veritabanı bağlantısı (window.db) bulunamadı!");
    alert("Hata: Veritabanı bağlantısı yok.");
    return;
  }
  try {
    await window.db.collection('players').doc(String(userId)).set(dataToSave, { merge: true });
    console.log(`Oyuncu ${userId} için veri başarıyla Firebase'e kaydedildi/güncellendi:`, dataToSave);
  } catch (error) {
    console.error("Firebase'e veri yazma hatası: ", error);
    alert("Veri kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.");
  }
}

// ==================== GÜNLÜK GÖREV (DAILY QUEST) SİSTEMİ - ANA GÖREV ====================
// Bu sabitleri global yapıyoruz ki social.js de bunlara erişebilsin
window.QUEST_MINE_COUNT_KEY = 'petMiner_questMineCount';
window.QUEST_LAST_UPDATE_DATE_KEY = 'petMiner_questLastUpdateDate';
window.QUEST_TARGET_MINES = 3; // Hem ana görev hem de modaldeki görev için genel hedef

// Bu sabitler sadece index.js içindeki ana günlük görev için, global yapmaya şimdilik gerek yok
const QUEST_REWARD_CLAIMED_DATE_KEY = 'petMiner_questRewardClaimedDate'; // Ana görevin ödülünün alındığı tarih
const DAILY_QUEST_REWARD_AMOUNT = 150; // Ana Günlük Görev ödül miktarı

function updateDailyQuestDisplay() {
    const questCountElement = document.getElementById('quest-count');
    const questProgressFillElement = document.getElementById('quest-progress');
    const claimBtnElement = document.getElementById('claim-btn'); // Earn sayfasındaki ana claim butonu
    const questCompleteMessageElement = document.getElementById('quest-complete');

    if (!questCountElement || !questProgressFillElement || !claimBtnElement || !questCompleteMessageElement) {
        return; 
    }

    const todayStr = new Date().toDateString();
    let currentMines = 0;
    const lastUpdateDate = localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY); // window. ile erişim

    if (lastUpdateDate === todayStr) {
        currentMines = parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0; // window. ile erişim
    } else {
        localStorage.setItem(window.QUEST_MINE_COUNT_KEY, '0'); // window. ile erişim
        localStorage.setItem(window.QUEST_LAST_UPDATE_DATE_KEY, todayStr); // window. ile erişim
        localStorage.removeItem(QUEST_REWARD_CLAIMED_DATE_KEY); // Ana görev için ödül bayrağını sıfırla
        currentMines = 0;
    }
    
    currentMines = Math.min(currentMines, window.QUEST_TARGET_MINES); // window. ile erişim

    questCountElement.textContent = currentMines;
    const progressPercent = (currentMines / window.QUEST_TARGET_MINES) * 100; // window. ile erişim
    questProgressFillElement.style.width = `${progressPercent}%`;

    const rewardClaimedToday = localStorage.getItem(QUEST_REWARD_CLAIMED_DATE_KEY) === todayStr;

    if (rewardClaimedToday) {
        claimBtnElement.disabled = true;
        claimBtnElement.innerHTML = '<i class="fas fa-check-circle"></i> Claimed';
        questCompleteMessageElement.classList.remove('hidden');
        questCompleteMessageElement.style.display = 'block';
    } else if (currentMines >= window.QUEST_TARGET_MINES) { // window. ile erişim
        claimBtnElement.disabled = false;
        claimBtnElement.innerHTML = '<i class="fas fa-gift"></i> Claim Reward';
        questCompleteMessageElement.classList.add('hidden');
        questCompleteMessageElement.style.display = 'none';
    } else {
        claimBtnElement.disabled = true;
        claimBtnElement.innerHTML = '<i class="fas fa-gift"></i>';
        questCompleteMessageElement.classList.add('hidden');
        questCompleteMessageElement.style.display = 'none';
    }
}

function recordMineForQuest() { 
    const todayStr = new Date().toDateString();
    let lastUpdateDate = localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY); // window. ile erişim
    let mineCount = 0;

    if (lastUpdateDate === todayStr) {
        mineCount = parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0; // window. ile erişim
    } else {
        localStorage.setItem(window.QUEST_LAST_UPDATE_DATE_KEY, todayStr); // window. ile erişim
        localStorage.setItem(window.QUEST_MINE_COUNT_KEY, '0'); // window. ile erişim
        localStorage.removeItem(QUEST_REWARD_CLAIMED_DATE_KEY); 
        mineCount = 0; 
    }

    const mainQuestRewardClaimedToday = localStorage.getItem(QUEST_REWARD_CLAIMED_DATE_KEY) === todayStr;

    if (mineCount < window.QUEST_TARGET_MINES && !mainQuestRewardClaimedToday) { // window. ile erişim
         mineCount++;
         localStorage.setItem(window.QUEST_MINE_COUNT_KEY, mineCount.toString()); // window. ile erişim
         console.log("Ana Günlük Görev Mine Sayısı Güncellendi:", mineCount);
    }
    updateDailyQuestDisplay(); 
}

// ==================== TAB SİSTEMİ ====================
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
        this.showPage('home');
    }

    showPage(pageId) {
        Object.values(this.pages).forEach(page => {
            if (page) { 
                page.classList.remove('active');
                page.style.display = 'none';
            }
        });
        if (this.pages[pageId]) { 
            this.pages[pageId].classList.add('active');
            this.pages[pageId].style.display = 'flex'; 
            this.tabs.forEach(tab => {
                tab.disabled = (tab.id.replace('Btn', '').toLowerCase() === pageId);
            });
            if (pageId === 'earn') {
                updateDailyQuestDisplay(); 
            }
        } else {
            console.error("Sayfa bulunamadı:", pageId);
        }
    }
}

// ==================== ARKADAŞ SİSTEMİ (Basit Başlangıç) ====================
function initFriendSystem() {
    console.log("Arkadaş sistemi başlatıldı (basit).");
}

// ==================== ENTEGRE MINING SISTEMI ====================
class MiningSystem {
    constructor() {
        this.cooldown = 8 * 60 * 60 * 1000; 
        this.coinDisplay = document.getElementById('coinDisplay');
        this.farmBtn = document.getElementById('farmButton');
        this.message = document.getElementById('message');
        this.isProcessing = false;
        this.cooldownBadge = document.querySelector('#miningContainer .cooldown-badge');
        this.init();
    }

    init() {
        if (!this.farmBtn) {
            console.error("Farm butonu (#farmButton) HTML'de bulunamadı!");
        } else {
            this.farmBtn.addEventListener('click', () => this.handleClick());
        }
        this.updateUI(); 
        setInterval(() => this.updateUI(), 1000); 

        if (this.isVIPActive() && localStorage.getItem('vip_cooldown')) {
            this.cooldown = parseInt(localStorage.getItem('vip_cooldown'));
        }
    }

    handleClick() {
        if (this.isProcessing || !this.farmBtn || this.farmBtn.disabled) return;
        this.isProcessing = true;
        try {
            this.handleMining(); 
        } catch (e) {
            console.error("Mining sırasında bir hata oluştu:", e);
        } finally {
            setTimeout(() => {
                this.isProcessing = false;
            }, 500); 
        }
    }

    handleMining() {
        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        const now = Date.now();
        const currentCooldownDuration = this.isVIPActive() && localStorage.getItem('vip_cooldown') 
                                     ? parseInt(localStorage.getItem('vip_cooldown')) 
                                     : this.cooldown;
        const remaining = currentCooldownDuration - (now - lastFarm);

        if (remaining <= 0) {
            const coinsToAdd = this.isVIPActive() ? 200 : 100; 
            this.addCoins(coinsToAdd); 
            localStorage.setItem('lastFarmTime', now.toString());
            recordMineForQuest(); 
            this.triggerAnimations();
            this.showMessage(coinsToAdd);
        }
        this.updateUI(); 
    }

    triggerAnimations() {
        if (!this.farmBtn) return;
        this.farmBtn.classList.add('vibrate'); 
        setTimeout(() => {
            if (this.farmBtn) this.farmBtn.classList.remove('vibrate');
        }, 300);
    }

    showMessage(coins) {
        if (!this.message) return;
        this.message.textContent = this.isVIPActive()
            ? `✨ VIP Bonus! +${coins} MPET`
            : `⛏️ Mined ${coins} MPET`;
        setTimeout(() => { 
            if (this.message) this.message.textContent = ''; 
        }, 3000); 
    }

    isVIPActive() { 
        const expiry = localStorage.getItem('vip_expiry');
        return expiry && Date.now() < parseInt(expiry);
    }

    addCoins(amount) {
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            console.error("addCoins: Eklenecek miktar geçerli bir pozitif sayı değil!", amount);
            return;
        }
        const currentCoins = parseInt(localStorage.getItem('coins')) || 0;
        const newTotalCoins = currentCoins + amount;
        localStorage.setItem('coins', newTotalCoins.toString());
        this.updateCoinDisplay(); 

        if (window.Telegram && window.Telegram.WebApp) {
            const webApp = window.Telegram.WebApp;
            const user = webApp.initDataUnsafe?.user;
            if (user && user.id) {
                const userId = user.id;
                const playerDataForFirebase = {
                    mpet: newTotalCoins,
                    lastPlayed: new Date(), 
                    telegramUsername: user.username || `user_${userId}`,
                    telegramFirstName: user.first_name || '',
                    telegramLastName: user.last_name || '', 
                    isVip: this.isVIPActive(), 
                };
                console.log(`Oyuncu ${userId} için Firebase'e veri gönderiliyor (addCoins içinden):`, playerDataForFirebase);
                savePlayerData(userId, playerDataForFirebase); 
            } else {
                console.warn("Telegram kullanıcı ID'si alınamadı. Veri Firebase'e kaydedilemedi (addCoins).");
            }
        } else {
            console.warn("Telegram WebApp objesi bulunamadı. Oyun Telegram dışında mı çalışıyor? Firebase'e kayıt yapılamayacak (addCoins).");
        }
    }

    updateCoinDisplay() {
        if (!this.coinDisplay) return;
        const coins = parseInt(localStorage.getItem('coins')) || 0;
        this.coinDisplay.textContent = `MPET: ${coins}`;
    }

    updateUI() {
        this.updateCoinDisplay();
        if (!this.farmBtn || !this.cooldownBadge) return;
        const lastFarm = parseInt(localStorage.getItem('lastFarmTime')) || 0;
        let currentCooldownDuration = this.isVIPActive() && localStorage.getItem('vip_cooldown') 
                                     ? parseInt(localStorage.getItem('vip_cooldown')) 
                                     : this.cooldown;
        let remaining = currentCooldownDuration - (Date.now() - lastFarm);
        if (remaining < 0) remaining = 0;
        this.updateButtonTextAndState(remaining);
    }

    updateButtonTextAndState(remaining) {
        if (!this.farmBtn || !this.cooldownBadge) return;
        if (remaining <= 0) { 
            this.farmBtn.disabled = false;
            this.farmBtn.classList.remove('inactive');
            this.farmBtn.innerHTML = 'Mining <i class="fas fa-hammer"></i>'; 
            this.cooldownBadge.textContent = 'READY!';
            this.cooldownBadge.style.color = '#33cccc'; 
        } else { 
            this.farmBtn.disabled = true;
            this.farmBtn.classList.add('inactive');
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            const timeString = `⌛ ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
            this.farmBtn.innerHTML = 'Mining <i class="fas fa-hammer"></i>'; 
            this.cooldownBadge.textContent = timeString;
            this.cooldownBadge.style.color = '#ff3377'; 
        }
    }
}

// ==================== GÜNLÜK GİRİŞ BONUSU SİSTEMİ ====================
const DAILY_BONUS_REWARD_MPET = 50;
const LOCAL_STORAGE_LAST_CLAIM_KEY = 'petMiner_lastDailyBonusClaimTime';
let claimDailyBonusBtnEl = null; 
let dailyBonusMessageEl = null;

function initDailyBonusSystem() {
    claimDailyBonusBtnEl = document.getElementById('claimDailyBonusBtn');
    dailyBonusMessageEl = document.getElementById('dailyBonusMessage');
    if (!claimDailyBonusBtnEl || !dailyBonusMessageEl) {
        console.warn("Günlük bonus HTML elementleri (#claimDailyBonusBtn veya #dailyBonusMessage) bulunamadı.");
        return;
    }
    checkDailyBonusStatus(); 
    claimDailyBonusBtnEl.addEventListener('click', handleClaimDailyBonus);
    console.log("Günlük Giriş Bonusu sistemi başlatıldı.");
}

function checkDailyBonusStatus() {
    if (!claimDailyBonusBtnEl || !dailyBonusMessageEl) return;
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
    if (typeof window.addCoinsGlobal === 'function') { 
        window.addCoinsGlobal(DAILY_BONUS_REWARD_MPET); 
        localStorage.setItem(LOCAL_STORAGE_LAST_CLAIM_KEY, Date.now().toString());
        checkDailyBonusStatus(); 
        if (dailyBonusMessageEl) dailyBonusMessageEl.textContent = `You received ${DAILY_BONUS_REWARD_MPET} MPET!`;
        setTimeout(() => {
             if (dailyBonusMessageEl && claimDailyBonusBtnEl.disabled) { 
                dailyBonusMessageEl.textContent = "Come back tomorrow for your next bonus!";
             }
        }, 2000);
    } else {
        console.error("window.addCoinsGlobal fonksiyonu bulunamadı! Günlük bonus verilemedi.");
        if (dailyBonusMessageEl) dailyBonusMessageEl.textContent = "Error claiming bonus. Please try again later.";
    }
}

// ==================== INITIALIZE APP (UYGULAMAYI BAŞLAT) ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM yüklendi. Sistemler başlatılıyor...");

    if (window.Telegram && window.Telegram.WebApp) {
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        console.log("Telegram WebApp arayüzü hazır ve genişletildi.");
    } else {
        console.warn("Telegram WebApp objesi bulunamadı. Tarayıcıda test ediliyor olabilir.");
    }

    window.tabSystemInstance = new TabSystem(); 
    initFriendSystem(); 
    
    window.miningSystemInstance = new MiningSystem(); 

    if (window.miningSystemInstance && typeof window.miningSystemInstance.addCoins === 'function') {
        window.addCoinsGlobal = window.miningSystemInstance.addCoins.bind(window.miningSystemInstance);
        console.log("window.addCoinsGlobal, miningSystemInstance.addCoins'e bağlandı.");
    } else {
        console.error("MiningSystem veya addCoins metodu düzgün başlatılamadı! Günlük bonus coin ekleyemeyebilir.");
        window.addCoinsGlobal = (amount) => { 
            console.warn(`Dummy addCoinsGlobal çağrıldı (${amount}), MiningSystem yüklenmedi.`);
        };
    }

    initDailyBonusSystem();

    const homePage = document.getElementById('homePage');
    if (homePage) {
        const smallVipBtn = document.createElement('button');
        smallVipBtn.id = 'navigateToVipBtn'; 
        smallVipBtn.innerHTML = '👑 <span style="font-size: 0.8em;">VIP Alanı</span>'; 
        smallVipBtn.className = 'small-vip-button tab-button'; 
        
        const dailyBonusContainer = document.getElementById('dailyBonusContainer');
        if (dailyBonusContainer) {
            if (dailyBonusContainer.parentNode === homePage) { 
                 dailyBonusContainer.insertAdjacentElement('afterend', smallVipBtn);
            } else {
                 const coinDisplayElement = document.getElementById('coinDisplay'); 
                 if (coinDisplayElement && homePage.contains(coinDisplayElement)) {
                     coinDisplayElement.parentNode.insertBefore(smallVipBtn, coinDisplayElement.nextSibling);
                 } else { homePage.appendChild(smallVipBtn); }
            }
        } else {
            const coinDisplayElement = document.getElementById('coinDisplay');
            if (coinDisplayElement) { 
                 coinDisplayElement.parentNode.insertBefore(smallVipBtn, coinDisplayElement.nextSibling);
            } else { homePage.appendChild(smallVipBtn); }
        }
        console.log("Ana Sayfaya küçük VIP yönlendirme butonu eklendi.");

        smallVipBtn.addEventListener('click', () => {
            if (window.tabSystemInstance) {
                window.tabSystemInstance.showPage('earn'); 
                setTimeout(() => {
                    const actualVipBtnOnEarnPage = document.getElementById('vipBtn'); 
                    if (actualVipBtnOnEarnPage) {
                        actualVipBtnOnEarnPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        actualVipBtnOnEarnPage.classList.add('highlight-vip'); 
                        setTimeout(() => {
                            if (actualVipBtnOnEarnPage) actualVipBtnOnEarnPage.classList.remove('highlight-vip');
                        }, 2500); 
                    } else {
                        console.warn("Earn sayfasındaki ana VIP butonu (vipBtn) bulunamadı.");
                    }
                }, 300); 
            } else {
                console.error("TabSystem instance (window.tabSystemInstance) bulunamadı.");
            }
        });
    } else {
        console.error("Ana Sayfa (homePage) elementi bulunamadı. Küçük VIP butonu eklenemedi.");
    }

    // Ana Günlük Görev Claim Butonu Mantığı (Earn Sayfasındaki)
    const claimQuestBtn = document.getElementById('claim-btn');
    if (claimQuestBtn) {
        claimQuestBtn.addEventListener('click', () => {
            const todayStr = new Date().toDateString();
            let currentMines = 0;
            const lastUpdateDate = localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY); // window. ile erişim
            if (lastUpdateDate === todayStr) {
                currentMines = parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0; // window. ile erişim
            }
            const rewardClaimedToday = localStorage.getItem(QUEST_REWARD_CLAIMED_DATE_KEY) === todayStr;
            console.log(`Ana Görev Claim butonu tıklandı: Current Mines: ${currentMines}, Target: ${window.QUEST_TARGET_MINES}, Claimed Today: ${rewardClaimedToday}`);

            if (currentMines >= window.QUEST_TARGET_MINES && !rewardClaimedToday) { // window. ile erişim
                if (typeof window.addCoinsGlobal === 'function') {
                    window.addCoinsGlobal(DAILY_QUEST_REWARD_AMOUNT); 
                    localStorage.setItem(QUEST_REWARD_CLAIMED_DATE_KEY, todayStr); 
                    const generalMessage = document.getElementById('message');
                    if(generalMessage) { 
                        generalMessage.textContent = `🎉 Daily Quest Reward: ${DAILY_QUEST_REWARD_AMOUNT} MPET Claimed!`;
                         setTimeout(() => {
                            if(generalMessage) generalMessage.textContent = '';
                        }, 3000);
                    }
                    console.log("Ana günlük görev ödülü alındı:", DAILY_QUEST_REWARD_AMOUNT);
                } else {
                    console.error("window.addCoinsGlobal fonksiyonu bulunamadı. Ana günlük görev ödülü verilemedi.");
                    alert("Ödül alınırken bir sorun oluştu.");
                }
                updateDailyQuestDisplay();
            } else if (rewardClaimedToday) {
                alert("Bugünkü ana günlük görev ödülünü zaten aldınız!");
            } else {
                alert(`Ana görevi tamamlamak için ${window.QUEST_TARGET_MINES - currentMines} mining daha yapmalısınız!`); // window. ile erişim
            }
        });
    }
    
    updateDailyQuestDisplay(); // Sayfa ilk yüklendiğinde ana görev durumunu göster

    // social.js'deki fonksiyonların ve olay dinleyicilerinin başlatılması
    // Bu fonksiyonların social.js içinde global olarak tanımlandığını varsayıyoruz.
    if (typeof initInviteButton === 'function') {
        initInviteButton();
    } else { console.error("initInviteButton fonksiyonu social.js'den yüklenemedi."); }

    if (typeof initVIPButton === 'function') {
        initVIPButton();
    } else { console.error("initVIPButton fonksiyonu social.js'den yüklenemedi."); }
    
    const bonusTasksBtn = document.getElementById('bonusTasksBtn');
    if (bonusTasksBtn) {
        bonusTasksBtn.addEventListener('click', () => {
            if (typeof showDailyTasksModal === 'function') { 
                showDailyTasksModal(); 
            } else {
                console.error("showDailyTasksModal fonksiyonu social.js'den yüklenemedi.");
            }
        });
    } else { console.warn("Bonus Tasks butonu (#bonusTasksBtn) HTML'de bulunamadı."); }

    const watchAdBtnOnEarnPage = document.getElementById('watchAdBtn');
    if (watchAdBtnOnEarnPage) {
        watchAdBtnOnEarnPage.addEventListener('click', () => {
            alert("Watch Ad (Earn Page) - Feature coming soon!"); 
        });
    } else { console.warn("Earn sayfasındaki ana Watch Ad butonu (#watchAdBtn) HTML'de bulunamadı."); }

    if (typeof updateVIPUI === 'function') { 
        updateVIPUI();
    } else { console.error("updateVIPUI fonksiyonu social.js'den yüklenemedi."); }

    console.log("Uygulama başlatıldı ve tüm sistemler yüklendi.");
});
