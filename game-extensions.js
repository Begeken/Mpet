// game-extensions.js

// ==================== DAILY BONUS SYSTEM ====================
function checkDailyBonus() {
    const today = new Date().toDateString();
    const lastBonus = localStorage.getItem('lastBonusDate');

    if (lastBonus !== today) {
        // Coin ekle (index.js'de tanımlanan ve Firebase'e de kaydeden global fonksiyonu kullan)
        if (typeof window.addCoinsGlobal === 'function') {
            window.addCoinsGlobal(50); // Günlük bonus olarak 50 MPET ekle
            console.log("Günlük bonus (50 MPET) eklendi ve Firebase'e kaydedilmek üzere gönderildi.");
        } else {
            console.error("window.addCoinsGlobal fonksiyonu tanımlı değil! Günlük bonus MPET eklenemedi ve Firebase'e kaydedilemedi.");
            // Eski bir fallback olarak window.addCoins'i deneyebiliriz ama bu Firebase'e kaydetmeyebilir.
            // if (typeof window.addCoins === 'function') {
            //     window.addCoins(50);
            //     console.warn("Günlük bonus MPET eklendi (window.addCoins ile), ancak Firebase'e kaydedilmemiş olabilir.");
            // } else {
            //     console.error("addCoins fonksiyonu da tanımlı değil! MPET eklenemedi.");
            // }
        }

        localStorage.setItem('lastBonusDate', today); // Bonusu bu gün için alındı olarak işaretle
        
        // showBonusMessage(); // Bu satırı yorumladık/sildik, böylece "🎁 Daily Bonus: 50 MPET!" mesajı gösterilmeyecek.
        // Eğer sadece yazıyı kaldırıp pulse efektini (başka bir amaçla) korumak isterseniz,
        // showBonusMessage fonksiyonunu çağırıp, o fonksiyonun içindeki msgElement.textContent satırını yorumlamanız gerekirdi.
        // Şu anki durumda, bonus mesajı ve pulse efekti bu fonksiyon aracılığıyla tetiklenmeyecek.
        console.log("Günlük bonus kontrolü yapıldı, bugün için bonus verildi (eğer ilk kez alınıyorsa). Mesaj gösterilmeyecek.");
    } else {
        console.log("Günlük bonus bugün zaten alınmış veya henüz uygun değil.");
    }
}

// Bonus mesajını göster fonksiyonu (artık checkDailyBonus içinden çağrılmıyor ama başka bir yerde kullanılabilir diye duruyor)
function showBonusMessage() {
    const msgElement = document.getElementById('message');
    if (msgElement) {
        // msgElement.textContent = "🎁 Daily Bonus: 50 MPET!"; // Bu satır mesajı gösteriyordu, isteğe bağlı olarak kaldırılabilir.
        // Sadece pulse efekti için bile bu fonksiyon çağrılabilir, eğer msgElement.textContent ayarlanmazsa.
        // Ancak şu anki checkDailyBonus fonksiyonu bunu çağırmıyor.
        msgElement.classList.add('pulse-effect');
        setTimeout(() => {
            if (msgElement) msgElement.classList.remove('pulse-effect');
        }, 3000);
    }
}

// ==================== MADENCİLİK ANİMASYONU (index.js'e taşındı) ====================
// Bu fonksiyonellik MiningSystem sınıfı içinde veya background-animation.js'de ele alınıyor.
// Burada bu başlık altında bir kod olmamalı.

// ==================== VIP DURUM KONTROLÜ (social.js'de de var, burada tutulmasına gerek yok) ====================
// Bu başlık altındaki kodlar da eğer social.js'de yönetiliyorsa buradan kaldırılabilir.
// Kod tekrarını önlemek adına, fonksiyonların tek bir yerde tanımlanıp oradan çağrılması daha iyidir.

// Uygulama başlatıldığında (DOM tamamen yüklendiğinde) Günlük Bonus Kontrolünü yap
document.addEventListener('DOMContentLoaded', () => {
    console.log("game-extensions.js: DOMContentLoaded tetiklendi. Günlük bonus kontrolü yapılıyor.");
    checkDailyBonus();
    // Diğer eklenti fonksiyonları veya başlatıcıları buraya eklenebilir.
});
