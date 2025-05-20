// social.js

// ==================== GÖREV SİSTEMİ İÇİN localStorage ANAHTARLARI VE SABİTLER ====================
const TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY = 'petMiner_taskModal_watchAd_completedDate';
const TASK_MODAL_WATCH_AD_REWARD = 25; // "Watch 1 Ad" modal görevinin ödülü

const TASK_MODAL_MINE_COMPLETED_DATE_KEY = 'petMiner_taskModal_mine_completedDate';
const TASK_MODAL_MINE_REWARD = 50; // Modaldeki "Mine 3 Times" görevinin ödülü

const TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY = 'petMiner_taskModal_invite_completedDate';
const TASK_MODAL_INVITE_FRIEND_REWARD = 75;

// index.js'de tanımlı ve window objesine atanmış olan ana Daily Quest (Mining) anahtarlarını kullanacağız.
// window.QUEST_MINE_COUNT_KEY
// window.QUEST_LAST_UPDATE_DATE_KEY
// window.QUEST_TARGET_MINES

// ==================== VİDEO REKLAM MODALI FONKSİYONU ====================
function showVideoAdModal(videoSrc, onVideoEndCallback) {
    // Eğer zaten bir video modalı açıksa, yenisini açma
    if (document.querySelector('.video-ad-modal-overlay')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'video-ad-modal-overlay'; // CSS'te stil tanımlayacağız
    modalOverlay.innerHTML = `
        <div class="video-ad-modal-content">
            <h4>Watch this short video to earn your reward!</h4>
            <video id="rewardVideoPlayer" width="100%" height="auto" controls playsinline>
                <source src="${videoSrc}" type="video/mp4">
                Your browser does not support the video tag. Please try a different browser.
            </video>
            <button class="close-video-btn" type="button">Close (No Reward)</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);

    const videoPlayer = modalOverlay.querySelector('#rewardVideoPlayer');
    const closeVideoBtn = modalOverlay.querySelector('.close-video-btn');

    const removeVideoModal = () => {
        if (videoPlayer) videoPlayer.pause(); // Videoyu durdur
        if (modalOverlay.parentNode) { // DOM'da olup olmadığını kontrol et
             modalOverlay.remove();
        }
    };

    if (videoPlayer) {
        videoPlayer.onended = () => {
            console.log("Video ad finished.");
            removeVideoModal();
            if (onVideoEndCallback) {
                onVideoEndCallback(true); // Başarıyla bittiğini bildir
            }
        };

        videoPlayer.onerror = () => {
            console.error("Video ad failed to load or play.");
            removeVideoModal();
            alert("Video could not be played. Please try again later.");
            if (onVideoEndCallback) {
                onVideoEndCallback(false); // Başarısız olduğunu bildir
            }
        };
        
        // Autoplay'i dene, tarayıcı engellerse kullanıcı manuel başlatır (controls var)
        videoPlayer.play().catch(error => {
            console.warn("Video autoplay was prevented:", error);
        });
    }

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => {
            removeVideoModal();
            if (onVideoEndCallback) {
                onVideoEndCallback(false); // Tamamlanmadığını bildir
            }
            showTemporaryMessageOnPage("Video closed. Reward not earned.");
        });
    }
}


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
    }
    inviteBtn.removeEventListener('click', handleInviteClick); 
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
    }
    vipBtn.removeEventListener('click', handleVIPClick); 
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
    `; // O küçük (Price will be shown...) yazısını kaldırdım, sizin isteğiniz üzerine.
    const closeBtn = modalOverlay.querySelector('.close-btn');
    const confirmBtn = modalOverlay.querySelector('.confirm-btn');
    const removeModal = () => { if (modalOverlay.parentNode) modalOverlay.remove(); };
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
            window.miningSystemInstance.cooldown = 8 * 60 * 60 * 1000; 
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
        updateModalTaskButtonsState(); 
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
        if (overlay && overlay.parentNode) overlay.remove();
    };
    
    const closeButton = modal.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', removeModal);
    }

    updateModalTaskButtonsState(modal); 

    document.body.appendChild(modal);
}

function updateModalTaskButtonsState(modalElement) {
    const modalToQuery = modalElement || document.querySelector('.daily-tasks-modal'); 
    if (!modalToQuery) return; 

    const todayStr = new Date().toDateString();

    // --- "Mine 3 Times" Görev Butonu ---
    const mineTaskButton = modalToQuery.querySelector('#taskBtnMineModal');
    if (mineTaskButton) {
        const newMineTaskButton = mineTaskButton.cloneNode(true); // Olay dinleyicilerini temizle
        mineTaskButton.parentNode.replaceChild(newMineTaskButton, mineTaskButton);
        
        updateSingleModalTaskButtonState(
            newMineTaskButton,
            localStorage.getItem(TASK_MODAL_MINE_COMPLETED_DATE_KEY) === todayStr,
            () => {
                const globalMineCount = (typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr)
                                        ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0)
                                        : 0;
                return globalMineCount >= (window.QUEST_TARGET_MINES || 3);
            },
            TASK_MODAL_MINE_REWARD,
            `${(typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0) : 0)}/${(window.QUEST_TARGET_MINES || 3)} Mines`
        );
        newMineTaskButton.addEventListener('click', (event) => {
            handleModalTaskClaim(event.target, TASK_MODAL_MINE_COMPLETED_DATE_KEY, TASK_MODAL_MINE_REWARD, () => {
                const globalMineCount = (typeof window.QUEST_LAST_UPDATE_DATE_KEY !== 'undefined' && localStorage.getItem(window.QUEST_LAST_UPDATE_DATE_KEY) === todayStr)
                                        ? (parseInt(localStorage.getItem(window.QUEST_MINE_COUNT_KEY)) || 0)
                                        : 0;
                return globalMineCount >= (window.QUEST_TARGET_MINES || 3);
            }, "Mine 3 Times Task");
        });
    }

    // --- "Watch 1 Ad" Görev Butonu (Video Modalını Çağıracak Şekilde Güncellendi) ---
    const watchAdButton = modalToQuery.querySelector('#taskBtnWatchAdModal');
    if (watchAdButton) {
        const newWatchAdButton = watchAdButton.cloneNode(true); // Olay dinleyicilerini temizle
        watchAdButton.parentNode.replaceChild(newWatchAdButton, watchAdButton);

        updateSingleModalTaskButtonState(
            newWatchAdButton,
            localStorage.getItem(TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_WATCH_AD_REWARD
        );
        newWatchAdButton.addEventListener('click', (event) => {
            if (localStorage.getItem(TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY) === todayStr) {
                alert("You have already completed the 'Watch Ad' task today.");
                return; 
            }
            const videoUrl = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"; 
            
            // Daily Tasks modalını hemen kapatmayalım.
            // showDailyTasksModal içindeki removeModal çağrısını yoruma aldık, video bitince veya kapatılınca işlem yapılacak.
            
            showVideoAdModal(videoUrl, (videoCompletedSuccessfully) => {
                if (videoCompletedSuccessfully) {
                    handleModalTaskClaim(newWatchAdButton, TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY, TASK_MODAL_WATCH_AD_REWARD, () => true, "Watch Ad Task");
                } else {
                    console.log("Video ad was not completed or was closed early.");
                }
                // Video modalı kapandıktan sonra Daily Tasks modalı hala açıksa buton durumlarını tazeleyebiliriz
                // Ancak showVideoAdModal içindeki callback zaten bu butonu güncelleyecektir.
                // Eğer Daily Tasks modalı kapatılıp tekrar açılırsa, updateModalTaskButtonsState zaten çalışacak.
                // Bu yüzden burada tekrar çağırmaya gerek olmayabilir.
                // updateModalTaskButtonsState(); // Bu satır çift güncellemeye neden olabilir, dikkatli olun.
            });
        });
    }
    
    // --- "Invite 1 Friend" Görev Butonu ---
    const inviteTaskButton = modalToQuery.querySelector('#taskBtnInviteModal');
    if (inviteTaskButton) {
        const newInviteTaskButton = inviteTaskButton.cloneNode(true); // Olay dinleyicilerini temizle
        inviteTaskButton.parentNode.replaceChild(newInviteTaskButton, inviteTaskButton);

        updateSingleModalTaskButtonState(
            newInviteTaskButton,
            localStorage.getItem(TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_INVITE_FRIEND_REWARD
        );
        newInviteTaskButton.addEventListener('click', (event) => {
            handleInviteClick(); 
            console.log("Invite Friend task: Invite action triggered.");
            handleModalTaskClaim(event.target, TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY, TASK_MODAL_INVITE_FRIEND_REWARD, () => true, "Invite Friend Task");
        });
    }
}

function updateSingleModalTaskButtonState(button, isClaimedToday, canClaimCheckCallback, reward, progressTextIfCannotClaim = null) {
    if (!button) return;
    if (isClaimedToday) {
        button.textContent = '✓ Completed';
        button.disabled = true;
    } else if (canClaimCheckCallback()) {
        button.textContent = `Claim (+${reward} MPET)`;
        button.disabled = false;
    } else {
        button.textContent = progressTextIfCannotClaim || `Claim (+${reward} MPET)`;
        button.disabled = true;
    }
}

function handleModalTaskClaim(buttonElement, localStorageKey, rewardAmount, canClaimCheckCallback, taskNameForLog = "Task") {
    if (localStorage.getItem(localStorageKey) === new Date().toDateString()) {
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
        alert(`Cannot claim '${taskNameForLog}' reward yet. Conditions not met.`);
        console.warn(`Attempted to claim '${taskNameForLog}' but conditions not met.`);
    }
}

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
