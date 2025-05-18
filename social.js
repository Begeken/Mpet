// ==================== TELEGRAM PAYLAŞIM BUTONU (Frens Sayfasına Eklenecek) ====================
function initInviteButton() {
  // Frens sayfası kontrolü
  const frensPage = document.getElementById('frensPage');
  if (!frensPage) {
    console.error('frensPage elementi bulunamadı!');
    return;
  }

  // Buton zaten varsa çık
  if (document.getElementById('inviteBtn')) return;

  const inviteBtn = document.createElement('button');
  inviteBtn.id = 'inviteBtn';
  inviteBtn.className = 'invite-button';
  inviteBtn.innerHTML = '<i class="fas fa-user-plus"></i> Invite Friends';

  // Butonu frensPage'e özel container ile ekle
  const inviteContainer = document.createElement('div');
  inviteContainer.className = 'invite-container';
  inviteContainer.appendChild(inviteBtn);
  frensPage.insertBefore(inviteContainer, frensPage.firstChild.nextSibling);

  inviteBtn.addEventListener('click', () => {
    if (window.Telegram?.WebApp) {
      const user = Telegram.WebApp.initDataUnsafe.user;
      const inviteText = `Join PetMiner! My ID: ${user?.id || ''}`;
      Telegram.WebApp.shareUrl(inviteText, window.location.href);
      
      // Analiz için
      if (typeof trackInvite === 'function') {
        trackInvite(user?.id);
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Invite link copied!'))
        .catch(() => prompt('Copy this link:', window.location.href));
    }
  });
}

// ==================== GELİŞMİŞ VIP BUTONU ====================
function initVIPButton() {
  // Buton zaten varsa çık
  if (document.getElementById('vipBtn')) return;
  
  const vipBtn = document.createElement('button');
  vipBtn.id = 'vipBtn';
  vipBtn.className = 'vip-button';
  vipBtn.innerHTML = '<i class="fas fa-crown"></i> VIP Membership';
  
  vipBtn.addEventListener('click', function() {
    if (window.Telegram?.WebApp) {
      Telegram.WebApp.showConfirm(
        "Get VIP for 99 MPET?",
        (confirmed) => {
          if (confirmed) {
            Telegram.WebApp.openInvoice('VIP_ITEM_LINK', (status) => {
              if (status === 'paid') {
                showVIPWelcome();
                activateVIPFeatures();
              }
            });
          }
        }
      );
    } else {
      showVIPModal();
    }
  });
  
  document.getElementById('earnPage')?.appendChild(vipBtn);
}

// ==================== YARDIMCI FONKSİYONLAR ====================
function showVIPModal() {
  const modalHTML = `
    <div class="vip-modal-overlay">
      <div class="vip-modal">
        <h3><i class="fas fa-crown"></i> VIP Benefits</h3>
        <ul>
          <li>2x Faster Mining</li>
          <li>Exclusive Pets</li>
          <li>No Ads</li>
        </ul>
        <button class="close-vip-modal">OK</button>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  document.querySelector('.close-vip-modal').addEventListener('click', () => {
    document.querySelector('.vip-modal-overlay').remove();
  });
}

function showVIPWelcome() {
  const message = document.getElementById('message');
  if (message) {
    message.innerHTML = '<i class="fas fa-crown"></i> Welcome to VIP Club!';
    message.style.color = '#ffd700';
    setTimeout(() => message.textContent = '', 3000);
  }
}

function activateVIPFeatures() {
  console.log('VIP features activated!');
  // VIP özelliklerini aktif etme kodu
}

// ==================== STIL ENJEKSIYONU ====================
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .invite-button {
      background: linear-gradient(90deg, #33cccc, #33eeee);
      color: #0a0f1a;
      border: none;
      padding: 8px 12px;          /* küçülttüm */
      font-size: 14px;            /* ekledim */
      border-radius: 8px;
      font-weight: bold;
      margin: 20px auto;
      display: block;
      width: 40%;                 /* küçülttüm */
      max-width: 150px;           /* küçülttüm */
      cursor: pointer;
      box-shadow: 0 0 15px rgba(51, 204, 204, 0.5);
      transition: all 0.3s;
    }
    .invite-button:hover {
      transform: scale(1.05);
      box-shadow: 0 0 25px rgba(51, 204, 204, 0.8);
    }
    .invite-container {
      text-align: center;
      margin: 30px 0;
      padding: 20px;
      background: rgba(15, 44, 49, 0.3);
      border-radius: 12px;
      border: 1px solid #33cccc;
    }
    .vip-button {
      background: linear-gradient(90deg, #ffd700, #ff9900);
      box-shadow: 0 0 15px #ffd700;
    }
    .vip-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .vip-modal {
      background: #0a0f1a;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid #ffd700;
      max-width: 300px;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
  `;
  document.head.appendChild(style);
}

// ==================== UYGULAMA BAŞLATMA ====================
document.addEventListener('DOMContentLoaded', function() {
  injectStyles();
  initInviteButton();
  initVIPButton();
  
  if (window.Telegram?.WebApp) {
    document.documentElement.classList.toggle(
      'dark-mode', 
      Telegram.WebApp.colorScheme === 'dark'
    );
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
  }
});