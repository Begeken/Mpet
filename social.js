// social.js

// ==================== GÖREV SİSTEMİ İÇİN localStorage ANAHTARLARI VE SABİTLER ====================
const TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY = 'petMiner_taskModal_watchAd_completedDate';
const TASK_MODAL_WATCH_AD_REWARD = 25;

const TASK_MODAL_MINE_COMPLETED_DATE_KEY = 'petMiner_taskModal_mine_completedDate';
const TASK_MODAL_MINE_REWARD = 50;

const TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY = 'petMiner_taskModal_invite_completedDate';
const TASK_MODAL_INVITE_FRIEND_REWARD = 75;

// index.js'de tanımlı ve window objesine atanmış olan ana Daily Quest (Mining) anahtarlarını kullanacağız.
// window.QUEST_MINE_COUNT_KEY
// window.QUEST_LAST_UPDATE_DATE_KEY
// window.QUEST_TARGET_MINES

// ==================== DAVET BUTONU ====================
function initInviteButton() {
    const frensPage = document.getElementById('frensPage');
    if (!frensPage) {
        console.error("Frens sayfası (frensPage) elementi bulunamadı!");
        return;
    }
    let inviteBtn = document.getElementById('inviteFriendBtn');
    if (!inviteBtn) {
        inviteBtn = document.createElement('button');
        inviteBtn.id = 'inviteFriendBtn';
        inviteBtn.className = 'invite-button';
        inviteBtn.innerHTML = '<i class="fas fa-user-plus"></i> Invite Friends';
        frensPage.appendChild(inviteBtn);
        // console.log("Davet butonu oluşturuldu."); // Tekrarlayan logları azaltabiliriz
    }
    inviteBtn.removeEventListener('click', handleInviteClick); // Olası çift eklemeyi önle
    inviteBtn.addEventListener('click', handleInviteClick);
}

// ==================== VIP BUTONU ====================
function initVIPButton() {
    const earnPage = document.getElementById('earnPage');
    if (!earnPage) {
        console.error("Earn sayfası (earnPage) elementi bulunamadı! VIP butonu eklenemiyor.");
        return;
    }
    let vipBtn = document.getElementById('vipBtn');
    const earnOptionsContainer = earnPage.querySelector('.earn-options');
    if (!earnOptionsContainer) {
        console.error(".earn-options div'i bulunamadı! VIP butonu eklenemiyor.");
        return;
    }
    if (!vipBtn) {
        vipBtn = document.createElement('button');
        vipBtn.id = 'vipBtn';
        vipBtn.className = 'earn-option neon-button vip-button';
        vipBtn.innerHTML = '<i class="fas fa-crown"></i> VIP Membership';
        earnOptionsContainer.appendChild(vipBtn);
        // console.log("VIP butonu .earn-options div'ine eklendi.");
    }
    vipBtn.removeEventListener('click', handleVIPClick); // Olası çift eklemeyi önle
    vipBtn.addEventListener('click', handleVIPClick);
}

// ==================== ORTAK FONKSİYONLAR ====================
function handleInviteClick() {
    if (window.Telegram?.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        const gameUrl = window.location.href; 
        const inviteText = `Join PetMiner, the best mining game on Telegram! 🚀 My User ID: ${user?.id || 'Unknown'}. Play now!`;
        Telegram.WebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(inviteText)}`);
    } else {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Invite link copied! Share it with your friends.'))
            .catch(() => prompt('Could not copy automatically. Please copy this link:', window.location.href));
    }
}

function handleVIPClick() {
    if (window.Telegram?.WebApp && typeof Telegram.WebApp.openInvoice === 'function') {
        showVIPModal((isConfirmedByModal) => {
            if (!isConfirmedByModal) return;
            const VIPTicketLink = "YOUR_TELEGRAM_INVOICE_LINK_FOR_VIP"; // <<< DEĞİŞTİRİN!!!
            if (VIPTicketLink === "YOUR_TELEGRAM_INVOICE_LINK_FOR_VIP" || !VIPTicketLink) {
                alert("VIP purchase is not configured yet. Please contact support.");
                console.error("VIP Ticket Link (Invoice Link) is not configured in social.js");
                return;
            }
            Telegram.WebApp.openInvoice(VIPTicketLink, (status) => {
                if (status === 'paid') {
                    activateVIP();
                    alert("🎉 VIP Membership Activated! Enjoy your benefits."); 
                } else if (status === 'cancelled') {
                    alert("VIP purchase cancelled.");
                } else if (status === 'failed' || status === 'pending') {
                    alert("VIP purchase failed or is still pending. Please try again or check your payment.");
                }
            });
        });
    } else {
        console.warn("Telegram WebApp or openInvoice not found. Simulating VIP process.");
        showVIPModal((isConfirmedByModal) => {
            if (isConfirmedByModal) {
                 activateVIP();
                 alert("🎉 VIP Membership Activated! (Test Mode)");
            }
        });
    }
}

function showVIPModal(onConfirm) {
    if (document.querySelector('.vip-modal-overlay')) return;
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'vip-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="vip-modal">
            <h3><i class="fas fa-crown"></i> VIP Benefits</h3>
            <ul>
                <li>⚡ 2x Faster Mining Cooldown</li>
                <li>✅ 100% Unlock on TGE</li> 
                <li>🚫 No Ads</li>
            </ul>
            <div class="modal-buttons">
                <button class="close-btn" type="button">Cancel</button>
                <button class="confirm-btn" type="button">Get VIP</button> 
            </div>

        </div>
    `;
    const closeBtn = modalOverlay.querySelector('.close-btn');
    const confirmBtn = modalOverlay.querySelector('.confirm-btn');
    const removeModal = () => modalOverlay.remove();
    closeBtn.addEventListener('click', () => { removeModal(); if (onConfirm) onConfirm(false); });
    confirmBtn.addEventListener('click', () => { removeModal(); if (onConfirm) onConfirm(true); });
    document.body.appendChild(modalOverlay);
}

// ==================== VIP ÜYELİK FONKSİYONLARI ====================
function activateVIP() {
    localStorage.setItem('vip_status', 'active');
    const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('vip_expiry', expiryTime.toString());
    const vipCooldown = 6 * 60 * 60 * 1000;
    localStorage.setItem('vip_cooldown', vipCooldown.toString());
    console.log("VIP Activated. Expiry:", new Date(expiryTime).toLocaleString(), "Cooldown set to:", vipCooldown / (60*60*1000) + " hours");
    if (typeof window.miningSystemInstance !== 'undefined' && window.miningSystemInstance) {
        window.miningSystemInstance.cooldown = vipCooldown;
        window.miningSystemInstance.updateUI(); 
        console.log("MiningSystem cooldown updated for VIP.");
    } else {
        console.warn("Global miningSystemInstance bulunamadı (social.js -> activateVIP).");
    }
    updateVIPUI();
}

function checkVIPStatus() {
    const expiry = localStorage.getItem('vip_expiry');
    if (expiry && Date.now() < parseInt(expiry)) {
        return true;
    }
    if (expiry && Date.now() >= parseInt(expiry)) {
        localStorage.removeItem('vip_status');
        localStorage.removeItem('vip_expiry');
        localStorage.removeItem('vip_cooldown');
        console.log("VIP status expired and local storage cleaned up.");
        if (typeof window.miningSystemInstance !== 'undefined' && window.miningSystemInstance) {
            window.miningSystemInstance.cooldown = 8 * 60 * 60 * 1000; // Varsayılan 8 saate dön
            window.miningSystemInstance.updateUI();
            console.log("VIP expired. MiningSystem cooldown reset to default.");
        }
    }
    return false;
}

function updateVIPUI() {
    const isVIP = checkVIPStatus();
    document.body.classList.toggle('vip-active', isVIP);
    const vipBtn = document.getElementById('vipBtn');
    if (vipBtn) {
        vipBtn.innerHTML = isVIP ? '🌟 VIP Active' : '<i class="fas fa-crown"></i> VIP Membership';
    }
}

// ==================== GÜNLÜK GÖREVLER MODALI (BONUS TASKS) ====================
function showDailyTasksModal() {
    if (document.querySelector('.daily-tasks-modal-overlay')) {
        updateModalTaskButtonsState(); // Eğer açıksa, butonları güncelle ve çık
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'daily-tasks-modal-overlay';
    modal.innerHTML = `
        <div class="daily-tasks-modal">
            <h3><i class="fas fa-tasks"></i> Daily Tasks</h3>
            <ul>
                <li>
                    <span><i class="fas fa-hammer"></i> Mine 3 Times</span>
                    <button class="task-button" data-task="mine" id="taskBtnMineModal" type="button">Claim (+${TASK_MODAL_MINE_REWARD})</button> 
                </li>
                <li>
                    <span><i class="fas fa-ad"></i> Watch 1 Ad</span>
                    <button class="task-button" data-task="watchAd" id="taskBtnWatchAdModal" type="button">Claim (+${TASK_MODAL_WATCH_AD_REWARD})</button>
                </li>
                <li>
                    <span><i class="fas fa-share-alt"></i> Invite 1 Friend</span>
                    <button class="task-button" data-task="invite" id="taskBtnInviteModal" type="button">Claim (+${TASK_MODAL_INVITE_FRIEND_REWARD})</button>
                </li>
            </ul>
            <button class="close-btn" type="button">Close</button>
        </div>
    `;

    const removeModal = () => {
        const overlay = document.querySelector('.daily-tasks-modal-overlay');
        if (overlay) overlay.remove();
    };
    
    const closeButton = modal.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', removeModal);
    }

    // Buton durumlarını ayarla ve olay dinleyicilerini ekle
    updateModalTaskButtonsState(modal); // Modal'ı parametre olarak gönderiyoruz ki içindeki butonları bulsun

    document.body.appendChild(modal);
}

// Modal içindeki TÜM görev butonlarının durumunu güncelleyen ve olay dinleyicilerini atayan yardımcı fonksiyon
function updateModalTaskButtonsState(modalElement) {
    const modalToQuery = modalElement || document.querySelector('.daily-tasks-modal'); // Eğer modalElement verilmemişse, açık olanı bul
    if (!modalToQuery) return; // Modal bulunamadıysa bir şey yapma

    const todayStr = new Date().toDateString();

    // --- "Mine 3 Times" Görev Butonu ---
    const mineTaskButton = modalToQuery.querySelector('#taskBtnMineModal');
    if (mineTaskButton) {
        updateSingleModalTaskButtonState(
            mineTaskButton,
            localStorage.getItem(TASK_MODAL_MINE_COMPLETED_DATE_KEY) === todayStr,
            () => {
                const globalMineCount = (typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr)
                                        ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0)
                                        : 0;
                return globalMineCount >= (window.QUEST_TARGET_MINES || 3);
            },
            TASK_MODAL_MINE_REWARD,
            // İlerleme metni: X/Y Mines
            `${(typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0) : 0)}/${(window.QUEST_TARGET_MINES || 3)} Mines`
        );
        // Olay dinleyicisini tekrar eklememek için önce kaldır (opsiyonel ama güvenli)
        mineTaskButton.replaceWith(mineTaskButton.cloneNode(true)); // Olay dinleyicilerini temizlemenin bir yolu
        modalToQuery.querySelector('#taskBtnMineModal').addEventListener('click', (event) => { // Yeniden seçip ekle
            handleModalTaskClaim(event.target, TASK_MODAL_MINE_COMPLETED_DATE_KEY, TASK_MODAL_MINE_REWARD, () => {
                const globalMineCount = (typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr)
                                        ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0)
                                        : 0;
                return globalMineCount >= (window.QUEST_TARGET_MINES || 3);
            }, "Mine 3 Times Task");
        });
    }

    // --- "Watch 1 Ad" Görev Butonu ---
    const watchAdButton = modalToQuery.querySelector('#taskBtnWatchAdModal');
    if (watchAdButton) {
        updateSingleModalTaskButtonState(
            watchAdButton,
            localStorage.getItem(TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_WATCH_AD_REWARD
        );
        watchAdButton.replaceWith(watchAdButton.cloneNode(true));
        modalToQuery.querySelector('#taskBtnWatchAdModal').addEventListener('click', (event) => {
            console.log("Watch Ad task: Simulating ad watch...");
            // Simülasyon: Reklamın izlendiğini varsayalım
            setTimeout(() => { // Reklam süresini simüle et
                 handleModalTaskClaim(event.target, TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY, TASK_MODAL_WATCH_AD_REWARD, () => true, "Watch Ad Task");
            }, 500);
        });
    }
    
    // --- "Invite 1 Friend" Görev Butonu ---
    const inviteTaskButton = modalToQuery.querySelector('#taskBtnInviteModal');
    if (inviteTaskButton) {
        updateSingleModalTaskButtonState(
            inviteTaskButton,
            localStorage.getItem(TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_INVITE_FRIEND_REWARD
        );
        inviteTaskButton.replaceWith(inviteTaskButton.cloneNode(true));
        modalToQuery.querySelector('#taskBtnInviteModal').addEventListener('click', (event) => {
            handleInviteClick(); 
            console.log("Invite Friend task: Invite action triggered.");
            // Davet sonrası hemen claim edilebilir varsayıyoruz
            handleModalTaskClaim(event.target, TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY, TASK_MODAL_INVITE_FRIEND_REWARD, () => true, "Invite Friend Task");
        });
    }
}

// Tek bir modal görev butonunun metnini ve durumunu güncelleyen yardımcı fonksiyon
function updateSingleModalTaskButtonState(button, isClaimedToday, canClaimCheckCallback, reward, progressTextIfCannotClaim = null) {
    if (!button) return;
    if (isClaimedToday) {
        button.textContent = '✓ Completed';
        button.disabled = true;
    } else if (canClaimCheckCallback()) {
        button.textContent = `Claim (+${reward} MPET)`;
        button.disabled = false;
    } else {
        button.textContent = progressTextIfCannotClaim || `Claim (+${reward} MPET)`; // Eğer progressText varsa onu göster
        button.disabled = true;
    }
}

// Modal içindeki bir görevi claim etme işlemini yapan yardımcı fonksiyon
function handleModalTaskClaim(buttonElement, localStorageKey, rewardAmount, canClaimCheckCallback, taskNameForLog = "Task") {
    if (localStorage.getItem(localStorageKey) === new Date().toDateString()) {
        // Bu kontrol updateSingleModalTaskButtonState tarafından zaten yapılmalı ve buton disabled olmalı,
        // ama ekstra bir güvenlik katmanı olarak kalabilir.
        // alert(`You have already claimed the '${taskNameForLog}' reward today.`);
        console.warn(`Attempted to claim '${taskNameForLog}' which was already claimed today or not claimable.`);
        return;
    }

    if (canClaimCheckCallback()) {
        if (typeof window.addCoinsGlobal === 'function') {
            window.addCoinsGlobal(rewardAmount);
            localStorage.setItem(localStorageKey, new Date().toDateString());
            buttonElement.textContent = '✓ Completed';
            buttonElement.disabled = true;
            showTemporaryMessageOnPage(`🎉 ${taskNameForLog} Reward: +${rewardAmount} MPET!`);
            console.log(`'${taskNameForLog}' görevi tamamlandı ve ödül verildi: +${rewardAmount} MPET`);
        } else {
            console.error(`window.addCoinsGlobal not found for '${taskNameForLog}' task reward.`);
            alert(`Error claiming reward (${taskNameForLog}).`);
        }
    } else {
        // Bu durum normalde updateSingleModalTaskButtonState tarafından engellenmeli (buton disabled olmalı)
        alert(`Cannot claim '${taskNameForLog}' reward yet. Conditions not met.`);
        console.warn(`Attempted to claim '${taskNameForLog}' but conditions not met.`);
    }
}

// Geçici mesaj göstermek için yardımcı fonksiyon
function showTemporaryMessageOnPage(text) {
    const messageElement = document.getElementById('message'); 
    if (messageElement) {
        messageElement.textContent = text;
        setTimeout(() => {
            if (messageElement) messageElement.textContent = ''; 
        }, 3000);
    } else {
        alert(text); 
    }
}

// Bu dosyadaki DOMContentLoaded listener'ı KALDIRILDI.
// Başlatma fonksiyonları (initInviteButton, initVIPButton) ve olay dinleyicileri
// (Bonus Tasks butonu için) index.js içindeki ana DOMContentLoaded listener'ından yönetilecektir.
