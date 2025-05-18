// ==================== TAB SYSTEM (FRONTEND) ====================
class TabSystem {
  constructor() {
    this.tabs = {
      home: document.getElementById('homePage'),
      earn: document.getElementById('earnPage'),
      wallet: document.getElementById('walletPage'),
      frens: document.getElementById('frensPage')
    };
    
    this.buttons = {
      home: document.getElementById('homeBtn'),
      earn: document.getElementById('earnBtn'),
      wallet: document.getElementById('walletBtn'),
      frens: document.getElementById('frensBtn')
    };
    
    this.init();
  }

  init() {
    // Tab button events
    Object.keys(this.buttons).forEach(tabName => {
      if (this.buttons[tabName]) {
        this.buttons[tabName].addEventListener('click', () => {
          this.openTab(tabName);
        });
      }
    });
    
    // Telegram Share Button
    this.initShareButton();
    
    // Default tab is home
    this.openTab('home');
  }

  openTab(tabName) {
    // Hide all pages
    Object.values(this.tabs).forEach(tab => {
      if (tab) tab.classList.remove('active');
    });
    
    // Enable all buttons
    Object.values(this.buttons).forEach(btn => {
      if (btn) btn.disabled = false;
    });
    
    // Show selected page
    if (this.tabs[tabName]) {
      this.tabs[tabName].classList.add('active');
      this.buttons[tabName].disabled = true;
    }
    
    // Telegram back button control
    if (window.Telegram?.WebApp) {
      if (tabName !== 'home') {
        Telegram.WebApp.BackButton.show();
      } else {
        Telegram.WebApp.BackButton.hide();
      }
    }
  }

  initShareButton() {
    if (!window.Telegram?.WebApp) return;
    
    const shareBtn = document.createElement('button');
    shareBtn.id = 'shareBtn';
    shareBtn.className = 'tab-button';
    shareBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share';
    
    shareBtn.addEventListener('click', () => {
      Telegram.WebApp.shareUrl(
        "Try PetMiner!",
        window.location.href + '?ref=' + Telegram.WebApp.initDataUnsafe.user?.id
      );
    });
    
    document.querySelector('.tabs')?.appendChild(shareBtn);
  }
}

// ==================== FRIEND SYSTEM (MOCK) ====================
// Note: Using localStorage instead of backend
function initFriendSystem() {
  // Example friend list
  if (!localStorage.getItem('friends')) {
    localStorage.setItem('friends', JSON.stringify([]));
  }
  
  // Add friend button
  document.getElementById('addFriendBtn')?.addEventListener('click', () => {
    const friendId = prompt("Enter your friend's Telegram ID:");
    if (friendId) {
      const friends = JSON.parse(localStorage.getItem('friends'));
      friends.push(friendId);
      localStorage.setItem('friends', JSON.stringify(friends));
      alert(`Friend added: ${friendId}`);
    }
  });
}

// ==================== INITIALIZE APP ====================
document.addEventListener('DOMContentLoaded', () => {
  // Start tab system
  new TabSystem();
  
  // Start friend system (mock)
  initFriendSystem();
  
  // When Telegram is ready
  if (window.Telegram?.WebApp) {
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();
    
    // Log user info
    console.log("Telegram User:", Telegram.WebApp.initDataUnsafe.user);
  }
});
