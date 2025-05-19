// ==================== TELEGRAM WEB APP INTEGRATION ====================
if (window.Telegram?.WebApp) {
    // 1. Initialize Telegram interface
    Telegram.WebApp.ready();
    Telegram.WebApp.expand();

    // 2. Theme control (dark/light)
    document.documentElement.classList.toggle(
        'dark-mode',
        Telegram.WebApp.colorScheme === 'dark'
    );

    // 3. Back button control
    Telegram.WebApp.BackButton.onClick(() => {
        const activePage = document.querySelector('.page.active');
        if (activePage && activePage.id !== 'homePage') {
            const currentPageId = activePage.id.replace('Page', '').toLowerCase();
            const homeButton = document.getElementById('homeBtn');
            if (homeButton) {
                homeButton.click(); // Ana sayfaya gitmek için home butonuna tıklayın
            } else {
                showPage('home'); // Fallback olarak showPage fonksiyonunu kullanın
            }
            Telegram.WebApp.BackButton.hide();
        }
    });

    // Sayfa geçişlerinde geri butonunu kontrol et
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (button.id !== 'homeBtn') {
                Telegram.WebApp.BackButton.show();
            } else {
                Telegram.WebApp.BackButton.hide();
            }
        });
    });
}

// Page switching (TabSystem sınıfında tanımlandı, burada gerek yok ama tutulabilir)
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    const targetPage = document.getElementById(`${pageId}Page`);
    if (targetPage) {
        targetPage.classList.add('active');
        targetPage.style.display = 'block';
    }
}

// Uygulama başlatıldığında (DOMContentLoaded zaten index.js'de dinleniyor)
// Buradaki kodlar gereksiz olabilir, index.js üzerinden yönetiliyor.