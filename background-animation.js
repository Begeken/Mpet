// background-animation.js

function initAdvancedSpaceRoadAnimation() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) {
        console.error("HATA: bgCanvas elementi HTML dosyasında bulunamadı!");
        return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x02030A);
    // scene.fog = null; // Sis kaldırılmış, bu satır doğru.

    // Kamera "far" değeri artırılmış, bu da iyi.
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000); 
    camera.position.set(0, 8, 180);
    camera.lookAt(0, 3, -500);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Izgaralar
    const gridSize = 200; 
    const gridDivisions = 25; 
    const gridColorCenterLine = 0x107070;
    const gridColorGrid = 0x0A3030;       

    const gridHelper1 = new THREE.GridHelper(gridSize, gridDivisions, gridColorCenterLine, gridColorGrid);
    gridHelper1.position.y = -2; 
    gridHelper1.position.z = 0;  
    scene.add(gridHelper1);

    const gridHelper2 = new THREE.GridHelper(gridSize, gridDivisions, gridColorCenterLine, gridColorGrid);
    gridHelper2.position.y = -2; 
    gridHelper2.position.z = -gridSize; 
    scene.add(gridHelper2);

    // Yıldızlar
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 12000; 
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    const colorWhite = new THREE.Color(0xffffff);
    const colorPaleBlue = new THREE.Color(0xb0c4de); 

    for (let i = 0; i < starCount; i++) {
        starPositions[i * 3 + 0] = (Math.random() - 0.5) * 4000; // Z eksenindeki dağılımı artıralım 
        starPositions[i * 3 + 1] = (Math.random() - 0.5) * 2000; 
        starPositions[i * 3 + 2] = (Math.random() - 0.5) * 4000; // Kamera far değerine yakın 
        starSizes[i] = Math.random() * 1.8 + 0.4; 
        const starColor = Math.random() > 0.4 ? colorPaleBlue : colorWhite;
        starColors[i * 3 + 0] = starColor.r;
        starColors[i * 3 + 1] = starColor.g;
        starColors[i * 3 + 2] = starColor.b;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starMaterial = new THREE.PointsMaterial({ size: 1, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, opacity: 0.65, sizeAttenuation: true, depthWrite: false });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Galaksi
    const textureLoader = new THREE.TextureLoader();
    // ÖNEMLİ: Galaksi doku yolunu kendi dosyanızla değiştirin!
    const galaxyTexture = textureLoader.load('abc.png'); 
    const galaxyMaterial = new THREE.MeshBasicMaterial({ map: galaxyTexture, transparent: true, opacity: 0.30, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const galaxyGeometry = new THREE.PlaneGeometry(30, 30); 
    const galaxyMesh = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
    galaxyMesh.position.set(0, 20, -40); 
    galaxyMesh.rotation.x = -Math.PI / 12; 
    scene.add(galaxyMesh);

    // Hız çizgileri (streaks)
    const streakCount = 700;
    const streakPositions = new Float32Array(streakCount * 3 * 2); 
    const streakColors = new Float32Array(streakCount * 3 * 2); 
    const streakGeometry = new THREE.BufferGeometry();

    const streakMaterial = new THREE.LineBasicMaterial({
        vertexColors: true, 
        linewidth: 1.5, 
        transparent: true,
        opacity: 0.7, 
        blending: THREE.AdditiveBlending
    });

    const streaks = new THREE.LineSegments(streakGeometry, streakMaterial);
    scene.add(streaks);

    const streakData = [];
    const neonColors = [
        new THREE.Color(0xffffff), new THREE.Color(0x00BFFF), new THREE.Color(0x87CEFA),
        new THREE.Color(0xBF00FF), new THREE.Color(0xFF00FF), new THREE.Color(0x8A2BE2),
        new THREE.Color(0xDA70D6) 
    ];

    const initialCameraZForStreaks = camera.position.z;
    // Çizgilerin kameranın ne kadar önünde görüneceği (ve yeniden doğacağı) mesafe
    const STREAK_MAX_VISIBLE_DEPTH = 1200; // Bu değeri artırarak çizgilerin daha uzaktan gelmesini sağlayabilirsiniz
    const STREAK_RESPAWN_DEPTH_VARIATION = 300; // Yeniden doğma Z pozisyonundaki rastgelelik

    for (let i = 0; i < streakCount; i++) {
        const randomColor = neonColors[Math.floor(Math.random() * neonColors.length)];
        streakData.push({
            x: (Math.random() - 0.5) * 300, 
            y: (Math.random() - 0.5) * 150 + camera.position.y, 
            // Başlangıçta çizgileri kameranın önündeki tüm görünür derinlik boyunca dağıt
            z_abs: initialCameraZForStreaks - (Math.random() * STREAK_MAX_VISIBLE_DEPTH),
            speed: Math.random() * 250 + 280, // Hızları biraz daha artırabiliriz
            color: randomColor,
            lineLength: Math.random() * 60 + 40 // Çizgi uzunlukları biraz daha belirgin olabilir
        });
    }

    function updateStreaks(camera_current_Z, delta_time) {
        // Çizgilerin kameranın ne kadar arkasında/yakınında kaybolup yeniden doğacağını belirleyen eşik
        const despawn_Z_threshold_behind_camera = 100; // Kameranın 100 birim arkasına geçtiğinde

        for (let i = 0; i < streakCount; i++) {
            const s = streakData[i];
            s.z_abs += s.speed * delta_time; // Kameraya doğru hareket

            // Eğer çizgi kamerayı yeterince geçtiyse (görüş alanının "yakın" tarafından çıktıysa)
            // onu hemen görüş alanının en "uzak" tarafına, rastgele X/Y ile yeniden yerleştir.
            if (s.z_abs > camera_current_Z + despawn_Z_threshold_behind_camera) { 
                s.z_abs = camera_current_Z - STREAK_MAX_VISIBLE_DEPTH - (Math.random() * STREAK_RESPAWN_DEPTH_VARIATION); 
                s.x = (Math.random() - 0.5) * 300; 
                s.y = (Math.random() - 0.5) * 150 + camera.position.y;      
            }

            streakPositions[i * 6 + 0] = s.x;
            streakPositions[i * 6 + 1] = s.y;
            streakPositions[i * 6 + 2] = s.z_abs; // Kafa
            streakPositions[i * 6 + 3] = s.x;
            streakPositions[i * 6 + 4] = s.y;
            streakPositions[i * 6 + 5] = s.z_abs - s.lineLength; // Kuyruk (daha uzakta)

            for(let j=0; j < 2; j++) {
                streakColors[i * 6 + j*3 + 0] = s.color.r;
                streakColors[i * 6 + j*3 + 1] = s.color.g;
                streakColors[i * 6 + j*3 + 2] = s.color.b;
            }
        }
        // Buffer attribute'lerini her zaman güncelle
        streakGeometry.setAttribute('position', new THREE.BufferAttribute(streakPositions, 3));
        streakGeometry.setAttribute('color', new THREE.BufferAttribute(streakColors, 3)); 
        // `needsUpdate` flag'leri attribute'ler yeniden atandığında genellikle otomatik olarak ayarlanır,
        // ama emin olmak için bırakılabilir veya kaldırılabilir.
        // streakGeometry.attributes.position.needsUpdate = true; 
        // streakGeometry.attributes.color.needsUpdate = true; 
    }

    const clock = new THREE.Clock();
    const roadSpeed = 30;
    let delta = 0;

    function animate() {
        requestAnimationFrame(animate);
        delta = clock.getDelta();
        if (delta > 0.1) delta = 0.1; // Max delta cap

        camera.position.z -= roadSpeed * delta;

        const cameraZ = camera.position.z;
        const halfGridSize = gridSize / 2; // Bunu döngü dışında tanımlamak daha iyi

        // Izgara leapfrog mantığı doğru görünüyor
        if (cameraZ < (gridHelper1.position.z - halfGridSize)) {
            gridHelper1.position.z -= 2 * gridSize;
        }
        if (cameraZ < (gridHelper2.position.z - halfGridSize)) {
            gridHelper2.position.z -= 2 * gridSize;
        }

        // Yıldız ve Galaksi pozisyonlarını kameraya göre ayarla (paralaks)
        stars.position.z = camera.position.z * 0.8 - 600;
        galaxyMesh.position.z = camera.position.z * 0.7 - 700;

        stars.rotation.y += delta * 0.005;
        galaxyMesh.rotation.z += delta * 0.01;

        updateStreaks(camera.position.z, delta);

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
    // console.log mesajı güncellendi
    console.log("Uzay Yolu (Sonsuz Çizgiler v4 - İyileştirilmiş Döngü) başlatıldı!"); 
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.Telegram?.WebApp && typeof window.Telegram.WebApp.ready === 'function') {
        window.Telegram.WebApp.ready();
        initAdvancedSpaceRoadAnimation();
    } else {
        initAdvancedSpaceRoadAnimation();
    }
});
