// ==================== DAVET BUTONU ====================
function initInviteButton() {
    const frensPage = document.getElementById('frensPage');
    if (!frensPage) return;

    const oldInvite = document.getElementById('inviteFriendBtn'); // Doğru ID'yi kontrol et
    if (oldInvite) oldInvite.remove();

    const inviteBtn = document.createElement('button');
    inviteBtn.id = 'inviteFriendBtn'; // Doğru ID
    inviteBtn.className = 'invite-button';
    inviteBtn.innerHTML = '<i class="fas fa-user-plus"></i> Invite Friends';

    frensPage.appendChild(inviteBtn); // Doğrudan frensPage'e ekle

    inviteBtn.addEventListener('click', handleInviteClick);
    console.log("Davet butonu oluşturuldu ve olay dinleyicisi eklendi.");
}

// ==================== VIP BUTONU ====================
function initVIPButton() {
    const earnPage = document.getElementById('earnPage');
    if (!earnPage) return;

    const oldVIP = document.getElementById('vipBtn');
    if (oldVIP) {
        oldVIP.remove();
        console.log("Eski VIP butonu kaldırıldı.");
    }

    const vipBtn = document.createElement('button');
    vipBtn.id = 'vipBtn';
    vipBtn.className = 'earn-option neon-button vip-button'; // earn-option ve neon-button sınıflarını ekledim
    vipBtn.innerHTML = '<i class="fas fa-crown"></i> VIP Membership';

    const earnOptions = earnPage.querySelector('.earn-options');
    if (earnOptions) {
        earnOptions.appendChild(vipBtn);
        console.log("VIP butonu .earn-options div'ine eklendi.");
    } else {
        console.error(".earn-options div'i bulunamadı!");
        return;
    }

    vipBtn.addEventListener('click', handleVIPClick);
    console.log("VIP butonu oluşturuldu ve olay dinleyicisi eklendi.");
}

// ==================== ORTAK FONKSİYONLAR ====================
function handleInviteClick() {
    if (window.Telegram?.WebApp) {
        const user = Telegram.WebApp.initDataUnsafe?.user;
        const inviteText = `Join PetMiner! My ID: ${user?.id || '12345'}`;
        Telegram.WebApp.openLink(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(inviteText)}`);
    } else {
        navigator.clipboard.writeText(window.location.href)
            .then(() => alert('Invite link copied!'))
            .catch(() => prompt('Copy this link:', window.location.href));
    }
}

function handleVIPClick() {
    if (window.Telegram?.WebApp) {
        showVIPModal(() => {
            // Kullanıcı VIP almak istediğini onayladı
            Telegram.WebApp.openInvoice('VIP_ITEM_LINK', (status) => {
                if (status === 'paid') {
                    activateVIP();
                    showVIPWelcome();
                }
            });
        });
    } else {
        showVIPModal(); // Telegram dışı ortam için geri çağırmaya gerek yok (şimdilik)
    }
}

function showVIPModal(onConfirm) {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'vip-modal-overlay';
    modalOverlay.innerHTML = `
        <div class="vip-modal">
            <h3><i class="fas fa-crown"></i> VIP Benefits</h3>
            <ul>
                <li>2x Faster Mining</li>
                <li>Exclusive Pets</li>
                <li>No Ads</li>
            </ul>
            <div class="modal-buttons">
                <button class="close-btn">Cancel</button>
                <button class="confirm-btn">Get VIP for 99 MPET</button>
            </div>
        </div>
    `;

    const closeBtn = modalOverlay.querySelector('.close-btn');
    const confirmBtn = modalOverlay.querySelector('.confirm-btn');

    closeBtn.addEventListener('click', () => {
        modalOverlay.remove();
    });

    confirmBtn.addEventListener('click', () => {
        modalOverlay.remove();
        if (onConfirm) {
            onConfirm(); // Geri çağırma fonksiyonunu çalıştır
        }
    });

    document.body.appendChild(modalOverlay);
}

// ==================== VIP ÜYELİK FONKSİYONLARI ====================
function activateVIP() {
    // VIP özelliklerini aktif et
    localStorage.setItem('vip_status', 'active');
    localStorage.setItem('vip_expiry', Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün

    // Mining süresini 6 saate düşür
    localStorage.setItem('vip_cooldown', 6 * 60 * 60 * 1000); // 6 saat

    // index.js'deki MiningSystem örneğinin cooldown'unu güncelle
    // Dikkat: Burada global bir MiningSystem örneğine erişmeniz gerekebilir.
    // Eğer yoksa, bu satır hata verebilir. index.js'de global bir değişkene atayabilirsiniz.
    if (typeof miningSystem !== 'undefined') {
        miningSystem.cooldown = 6 * 60 * 60 * 1000;
        miningSystem.updateUI(); // UI'ı güncelle
    }

    updateVIPUI();
}

function checkVIPStatus() {
    const expiry = localStorage.getItem('vip_expiry');
    if (expiry && Date.now() < parseInt(expiry)) {
        return true;
    }
    return false;
}

function updateVIPUI() {
    const isVIP = checkVIPStatus();
    document.body.classList.toggle('vip-active', isVIP);

    const vipBtn = document.getElementById('vipBtn');
    if (vipBtn) {
        vipBtn.textContent = isVIP ? '🌟 VIP Active' : '<i class="fas fa-crown"></i> VIP Membership';
    }
    const farmBtn = document.getElementById('farmButton');
    if (farmBtn) {
        // Farm butonunun metnini VIP durumuna göre güncelleyebilirsiniz (isteğe bağlı)
    }
}

function showDailyTasksModal() {
    const modal = document.createElement('div');
    modal.className = 'daily-tasks-modal-overlay';
    modal.innerHTML = `
        <div class="daily-tasks-modal">
            <h3><i class="fas fa-tasks"></i> Daily Tasks</h3>
            <ul>
                <li>
                    <i class="fas fa-hammer"></i> Mine 3 Times (+50 MPET)
                    <button class="task-button" data-task="mine">Claim</button> 
                </li>
                <li>
                    <i class="fas fa-ad"></i> Watch 1 Ad (+25 MPET)
                    <button class="task-button" data-task="watchAd">Claim</button>
                </li>
                <li>
                    <i class="fas fa-share-alt"></i> Invite 1 Friend (+75 MPET)
                    <button class="task-button" data-task="invite">Claim</button>
                </li>
            </ul>
            <button class="close-btn">Close</button>
        </div>
    `;

    const closeButton = modal.querySelector('.close-btn');
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            modal.remove();
        });
    }

    const taskButtons = modal.querySelectorAll('.task-button');
    taskButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const taskType = event.target.dataset.task;
            // Burada görevin tamamlandığını işaretleme ve ödül verme mantığını ekleyebilirsiniz.
            alert(`${taskType} Mission Completed! (Ödül verme mantığı henüz eklenmedi)`);
            event.target.disabled = true; // Butonu devre dışı bırak
            event.target.textContent = '✓ Completed';
        });
    });

    document.body.appendChild(modal);
}

// Earn sayfası butonları için olay dinleyicileri VE buton oluşturma fonksiyonlarını çağır
document.addEventListener('DOMContentLoaded', () => {
    initInviteButton();
    initVIPButton();

    const bonusTasksBtn = document.getElementById('bonusTasksBtn');
    if (bonusTasksBtn) {
        bonusTasksBtn.addEventListener('click', () => {
            console.log("Bonus Tasks butonu tıklandı!");
            showDailyTasksModal(); // Günlük görev modalını göster
        });
    } else {
        console.error("Bonus Tasks butonu bulunamadı!");
    }

    const watchAdBtn = document.getElementById('watchAdBtn');
    if (watchAdBtn) {
        watchAdBtn.addEventListener('click', () => {
            console.log("Watch Ad butonu tıklandı!");
            alert("Reklam izleme henüz aktif değil!"); // Örnek işlevsellik
        });
    } else {
        console.error("Watch Ad butonu bulunamadı!");
    }

    updateVIPUI(); // Sayfa yüklendiğinde VIP UI'ını güncelle
});
