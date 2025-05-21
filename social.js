// social.js

// ==================== HAFTALIK GÖREV SABİTLERİ (YENİ) ====================
const WEEKLY_TASK_MINE_COUNT_KEY = 'petMiner_taskWeekly_mineCount';
const WEEKLY_TASK_MINE_LAST_RESET_KEY = 'petMiner_taskWeekly_lastResetMondayUTC'; // En son sıfırlamanın yapıldığı Pazartesi 00:00 UTC'yi saklar
const WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY = 'petMiner_taskWeekly_mineCompletedKey'; // Bu haftanın görevinin tamamlandığı Pazartesi 00:00 UTC'yi saklar
const WEEKLY_TASK_MINE_TARGET = 15;
const WEEKLY_TASK_MINE_REWARD = 1000;

// ==================== DİĞER MODAL GÖREV SABİTLERİ (MEVCUT) ====================
const TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY = 'petMiner_taskModal_watchAd_completedDate';
const TASK_MODAL_WATCH_AD_REWARD = 25;

const TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY = 'petMiner_taskModal_invite_completedDate';
const TASK_MODAL_INVITE_FRIEND_REWARD = 75;

// ==================== YARDIMCI FONKSİYONLAR (HAFTALIK GÖREV İÇİN - YENİ) ====================
// Verilen bir tarihe göre o haftanın Pazartesi 00:00 UTC'sini Date objesi olarak döndürür
function getStartOfWeekUTC(date = new Date()) {
    const d = new Date(date.getTime());
    const day = d.getUTCDay(); // Pazar = 0, Pazartesi = 1, ..., Cumartesi = 6
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1); // Pazartesiye ayarla (Pazar ise önceki Pzt)
    const monday = new Date(d.setUTCDate(diff));
    monday.setUTCHours(0, 0, 0, 0); // Saati 00:00:00.000 yap
    return monday;
}

// Haftalık mining sayacını artıran ve global olarak çağrılacak fonksiyon (YENİ)
function recordMineForWeeklyTask() {
    const currentWeekStart = getStartOfWeekUTC();
    const currentWeekStartString = currentWeekStart.toISOString(); // Karşılaştırma için string formatı

    let lastResetWeek = localStorage.getItem(WEEKLY_TASK_MINE_LAST_RESET_KEY);
    let weeklyMineCount = 0;

    if (lastResetWeek === currentWeekStartString) {
        weeklyMineCount = parseInt(localStorage.getItem(WEEKLY_TASK_MINE_COUNT_KEY)) || 0;
    } else {
        // Yeni hafta, sayaçları sıfırla
        localStorage.setItem(WEEKLY_TASK_MINE_LAST_RESET_KEY, currentWeekStartString);
        localStorage.setItem(WEEKLY_TASK_MINE_COUNT_KEY, '0');
        localStorage.removeItem(WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY); // Ödül bayrağını temizle
        weeklyMineCount = 0;
    }

    const rewardClaimedThisWeek = localStorage.getItem(WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY) === currentWeekStartString;

    if (weeklyMineCount < WEEKLY_TASK_MINE_TARGET && !rewardClaimedThisWeek) {
        weeklyMineCount++;
        localStorage.setItem(WEEKLY_TASK_MINE_COUNT_KEY, weeklyMineCount.toString());
        console.log("Haftalık Görev Mine Sayısı Güncellendi:", weeklyMineCount);
    }
    // Modal açıksa UI'ı güncellemek için updateModalTaskButtonsState çağrılabilir,
    // ama zaten modal her açıldığında bu fonksiyon çalışıyor.
}
// Bu fonksiyonu index.js'den çağırabilmek için global yapalım
window.recordMineForWeeklyTask = recordMineForWeeklyTask;


// ==================== VİDEO REKLAM MODALI FONKSİYONU (MEVCUT) ====================
function showVideoAdModal(videoSrc, onVideoEndCallback) {
    if (document.querySelector('.video-ad-modal-overlay')) return;
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'video-ad-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="video-ad-modal-content">
            <h4>Watch this short video to earn your reward!</h4>
            <video id="rewardVideoPlayer" width="100%" height="auto" controls playsinline>
                <source src="${videoSrc}" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            <button class="close-video-btn" type="button">Close (No Reward)</button>
        </div>
    `;
    document.body.appendChild(modalOverlay);
    const videoPlayer = modalOverlay.querySelector('#rewardVideoPlayer');
    const closeVideoBtn = modalOverlay.querySelector('.close-video-btn');
    const removeVideoModal = () => {
        if (videoPlayer) videoPlayer.pause();
        if (modalOverlay.parentNode) modalOverlay.remove();
    };
    if (videoPlayer) {
        videoPlayer.onended = () => { removeVideoModal(); if (onVideoEndCallback) onVideoEndCallback(true); };
        videoPlayer.onerror = () => { removeVideoModal(); alert("Video could not be played."); if (onVideoEndCallback) onVideoEndCallback(false); };
        videoPlayer.play().catch(error => console.warn("Video autoplay prevented:", error));
    }
    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', () => {
            removeVideoModal();
            if (onVideoEndCallback) onVideoEndCallback(false);
            showTemporaryMessageOnPage("Video closed. Reward not earned.");
        });
    }
}

// ==================== DAVET BUTONU (MEVCUT) ====================
function initInviteButton() {
    const frensPage = document.getElementById('frensPage');
    if (!frensPage) { console.error("Frens sayfası bulunamadı!"); return; }
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

// ==================== VIP BUTONU (MEVCUT) ====================
function initVIPButton() {
    const earnPage = document.getElementById('earnPage');
    if (!earnPage) { console.error("Earn sayfası bulunamadı! VIP butonu eklenemiyor."); return; }
    let vipBtn = document.getElementById('vipBtn');
    const earnOptionsContainer = earnPage.querySelector('.earn-options');
    if (!earnOptionsContainer) { console.error(".earn-options div'i bulunamadı! VIP butonu eklenemiyor."); return; }
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

// ==================== ORTAK FONKSİYONLAR (MEVCUT) ====================
function handleInviteClick() {
    if (window.Telegram?.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        const gameUrl = window.location.href; 
        const inviteText = `Join PetMiner! My ID: ${user?.id || 'Unknown'}. Play!`;
        Telegram.WebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(gameUrl)}&text=${encodeURIComponent(inviteText)}`);
    } else {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Invite link copied!'))
            .catch(() => prompt('Copy link:', window.location.href));
    }
}

function handleVIPClick() {
    if (window.Telegram?.WebApp && typeof Telegram.WebApp.openInvoice === 'function') {
        showVIPModal((isConfirmed) => {
            if (!isConfirmed) return;
            const VIPTicketLink = "YOUR_TELEGRAM_INVOICE_LINK_FOR_VIP"; // <<< DEĞİŞTİRİN!!!
            if (VIPTicketLink === "YOUR_TELEGRAM_INVOICE_LINK_FOR_VIP" || !VIPTicketLink) {
                alert("VIP purchase not configured."); console.error("VIP Invoice Link missing."); return;
            }
            Telegram.WebApp.openInvoice(VIPTicketLink, (status) => {
                if (status === 'paid') { activateVIP(); alert("🎉 VIP Activated!"); }
                else if (status === 'cancelled') { alert("VIP purchase cancelled."); }
                else { alert("VIP purchase failed/pending."); }
            });
        });
    } else {
        showVIPModal((isConfirmed) => { if (isConfirmed) { activateVIP(); alert("🎉 VIP Activated! (Test)"); } });
    }
}

function showVIPModal(onConfirm) {
    if (document.querySelector('.vip-modal-overlay')) return;
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'vip-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="vip-modal">
            <h3><i class="fas fa-crown"></i> VIP Benefits</h3>
            <ul><li>⚡ 2x Faster Mining Cooldown</li><li>✅ 100% Unlock on TGE</li><li>🚫 No Ads</li></ul>
            <div class="modal-buttons">
                <button class="close-btn" type="button">Cancel</button>
                <button class="confirm-btn" type="button">Get VIP</button> 
            </div>
        </div>`;
    const closeBtn = modalOverlay.querySelector('.close-btn');
    const confirmBtn = modalOverlay.querySelector('.confirm-btn');
    const remove = () => { if (modalOverlay.parentNode) modalOverlay.remove(); };
    closeBtn.addEventListener('click', () => { remove(); if (onConfirm) onConfirm(false); });
    confirmBtn.addEventListener('click', () => { remove(); if (onConfirm) onConfirm(true); });
    document.body.appendChild(modalOverlay);
}

// ==================== VIP ÜYELİK FONKSİYONLARI (MEVCUT) ====================
function activateVIP() {
    localStorage.setItem('vip_status', 'active');
    const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('vip_expiry', expiryTime.toString());
    const vipCooldown = 6 * 60 * 60 * 1000;
    localStorage.setItem('vip_cooldown', vipCooldown.toString());
    if (window.miningSystemInstance) {
        window.miningSystemInstance.cooldown = vipCooldown;
        window.miningSystemInstance.updateUI(); 
    }
    updateVIPUI();
}

function checkVIPStatus() {
    const expiry = localStorage.getItem('vip_expiry');
    if (expiry && Date.now() < parseInt(expiry)) return true;
    if (expiry && Date.now() >= parseInt(expiry)) {
        localStorage.removeItem('vip_status');
        localStorage.removeItem('vip_expiry');
        localStorage.removeItem('vip_cooldown');
        if (window.miningSystemInstance) {
            window.miningSystemInstance.cooldown = 8 * 60 * 60 * 1000; 
            window.miningSystemInstance.updateUI();
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

// ==================== GÜNLÜK GÖREVLER MODALI (BONUS TASKS) - GÜNCELLENDİ ====================
function showDailyTasksModal() {
    if (document.querySelector('.daily-tasks-modal-overlay')) {
        updateModalTaskButtonsState(); 
        return;
    }
    const modal = document.createElement('div');
    modal.className = 'daily-tasks-modal-overlay';
    modal.innerHTML = `
        <div class="daily-tasks-modal">
            <h3><i class="fas fa-tasks"></i>Tasks</h3>
            <ul>
                <li>
                    <span><i class="fas fa-hammer"></i> Mine ${WEEKLY_TASK_MINE_TARGET} Times (Weekly)</span>
                    <button class="task-button" data-task="weeklyMine" id="taskBtnWeeklyMineModal" type="button">Claim (+${WEEKLY_TASK_MINE_REWARD})</button> 
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
    const removeModal = () => { if (modal.parentNode) modal.remove(); };
    const closeButton = modal.querySelector('.close-btn');
    if (closeButton) closeButton.addEventListener('click', removeModal);
    
    updateModalTaskButtonsState(modal); 
    document.body.appendChild(modal);
}

function updateModalTaskButtonsState(modalElement) {
    const modalToQuery = modalElement || document.querySelector('.daily-tasks-modal'); 
    if (!modalToQuery) return; 

    const todayStr = new Date().toDateString(); // Günlük görevler için
    const currentWeekStart = getStartOfWeekUTC(); // Haftalık görev için
    const currentWeekStartString = currentWeekStart.toISOString();

    // --- Haftalık "Mine X Times" Görev Butonu (YENİ/GÜNCELLENMİŞ) ---
    const weeklyMineTaskButton = modalToQuery.querySelector('#taskBtnWeeklyMineModal'); // ID değişti
    if (weeklyMineTaskButton) {
        const newWeeklyMineTaskButton = weeklyMineTaskButton.cloneNode(true);
        weeklyMineTaskButton.parentNode.replaceChild(newWeeklyMineTaskButton, weeklyMineTaskButton);
        
        let currentWeeklyMines = 0;
        if (localStorage.getItem(WEEKLY_TASK_MINE_LAST_RESET_KEY) === currentWeekStartString) {
            currentWeeklyMines = parseInt(localStorage.getItem(WEEKLY_TASK_MINE_COUNT_KEY)) || 0;
        } else { // Yeni hafta ise sıfırla (aslında recordMineForWeeklyTask bunu yapar ama UI için de kontrol)
            localStorage.setItem(WEEKLY_TASK_MINE_LAST_RESET_KEY, currentWeekStartString);
            localStorage.setItem(WEEKLY_TASK_MINE_COUNT_KEY, '0');
            localStorage.removeItem(WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY);
        }
        currentWeeklyMines = Math.min(currentWeeklyMines, WEEKLY_TASK_MINE_TARGET);

        updateSingleModalTaskButtonState(
            newWeeklyMineTaskButton,
            localStorage.getItem(WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY) === currentWeekStartString,
            () => currentWeeklyMines >= WEEKLY_TASK_MINE_TARGET,
            WEEKLY_TASK_MINE_REWARD,
            `${currentWeeklyMines}/${WEEKLY_TASK_MINE_TARGET} Mines (Weekly)`
        );
        newWeeklyMineTaskButton.addEventListener('click', (event) => {
            handleModalTaskClaim(event.target, WEEKLY_TASK_MINE_COMPLETED_THIS_WEEK_KEY, WEEKLY_TASK_MINE_REWARD, () => {
                let count = 0;
                 if (localStorage.getItem(WEEKLY_TASK_MINE_LAST_RESET_KEY) === getStartOfWeekUTC().toISOString()) {
                    count = parseInt(localStorage.getItem(WEEKLY_TASK_MINE_COUNT_KEY)) || 0;
                 }
                return count >= WEEKLY_TASK_MINE_TARGET;
            }, "Weekly Mine Task", currentWeekStartString); // Haftanın başlangıç string'ini gönder
        });
    }

    // --- "Watch 1 Ad" Görev Butonu (MEVCUT - Video Modalını Çağıracak) ---
    const watchAdButton = modalToQuery.querySelector('#taskBtnWatchAdModal');
    if (watchAdButton) {
        const newWatchAdButton = watchAdButton.cloneNode(true);
        watchAdButton.parentNode.replaceChild(newWatchAdButton, watchAdButton);
        updateSingleModalTaskButtonState(
            newWatchAdButton,
            localStorage.getItem(TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_WATCH_AD_REWARD
        );
        newWatchAdButton.addEventListener('click', (event) => {
            if (localStorage.getItem(TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY) === todayStr) {
                alert("You have already completed the 'Watch Ad' task today."); return; 
            }
            const videoUrl = "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4"; 
            showVideoAdModal(videoUrl, (videoCompletedSuccessfully) => {
                if (videoCompletedSuccessfully) {
                    handleModalTaskClaim(newWatchAdButton, TASK_MODAL_WATCH_AD_COMPLETED_DATE_KEY, TASK_MODAL_WATCH_AD_REWARD, () => true, "Watch Ad Task", todayStr);
                } else { console.log("Video ad not completed."); }
            });
        });
    }
    
    // --- "Invite 1 Friend" Görev Butonu (MEVCUT) ---
    const inviteTaskButton = modalToQuery.querySelector('#taskBtnInviteModal');
    if (inviteTaskButton) {
        const newInviteTaskButton = inviteTaskButton.cloneNode(true);
        inviteTaskButton.parentNode.replaceChild(newInviteTaskButton, inviteTaskButton);
        updateSingleModalTaskButtonState(
            newInviteTaskButton,
            localStorage.getItem(TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY) === todayStr,
            () => true, 
            TASK_MODAL_INVITE_FRIEND_REWARD
        );
        newInviteTaskButton.addEventListener('click', (event) => {
            handleInviteClick(); 
            handleModalTaskClaim(event.target, TASK_MODAL_INVITE_FRIEND_COMPLETED_DATE_KEY, TASK_MODAL_INVITE_FRIEND_REWARD, () => true, "Invite Friend Task", todayStr);
        });
    }
}

// Tek bir modal görev butonunun metnini ve durumunu güncelleyen yardımcı fonksiyon (MEVCUT)
function updateSingleModalTaskButtonState(button, isClaimedTodayOrThisWeek, canClaimCheckCallback, reward, progressTextIfCannotClaim = null) {
    if (!button) return;
    if (isClaimedTodayOrThisWeek) { // Parametre adı güncellendi
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

// Modal içindeki bir görevi claim etme işlemini yapan yardımcı fonksiyon (GÜNCELLENDİ - dateStringToCompare parametresi eklendi)
function handleModalTaskClaim(buttonElement, localStorageKey, rewardAmount, canClaimCheckCallback, taskNameForLog = "Task", dateStringToCompare) {
    if (localStorage.getItem(localStorageKey) === dateStringToCompare) { // todayStr yerine dateStringToCompare
        console.warn(`Attempted to claim '${taskNameForLog}' which was already claimed for this period.`);
        return;
    }
    if (canClaimCheckCallback()) {
        if (typeof window.addCoinsGlobal === 'function') {
            window.addCoinsGlobal(rewardAmount);
            localStorage.setItem(localStorageKey, dateStringToCompare); // todayStr yerine dateStringToCompare
            buttonElement.textContent = '✓ Completed';
            buttonElement.disabled = true;
            showTemporaryMessageOnPage(`🎉 ${taskNameForLog} Reward: +${rewardAmount} MPET!`);
        } else {
            console.error(`window.addCoinsGlobal not found for '${taskNameForLog}' task reward.`);
            alert(`Error claiming reward (${taskNameForLog}).`);
        }
    } else {
        alert(`Cannot claim '${taskNameForLog}' reward yet. Conditions not met.`);
    }
}

// Geçici mesaj göstermek için yardımcı fonksiyon (MEVCUT)
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
// Başlatma fonksiyonları index.js içindeki ana DOMContentLoaded listener'ından yönetilecektir.