document.addEventListener('DOMContentLoaded', () => {

    // === BAGIAN 0: LOGIKA MUSIK ===
    const music = document.getElementById('background-music');
    const musicBtn = document.getElementById('music-toggle-btn');
    music.volume = 0.15; // Volume 15%
    let isMusicPlaying = false; 
    let isExampleTyped = false; 

    function toggleMusic() {
        if (isMusicPlaying) {
            music.pause();
            musicBtn.textContent = 'Musik Off';
            musicBtn.classList.remove('active');
            isMusicPlaying = false;
        } else {
            music.play();
            musicBtn.textContent = 'Musik On';
            musicBtn.classList.add('active');
            isMusicPlaying = true;
        }
    }
    musicBtn.addEventListener('click', toggleMusic);
    // ==================================


    // === BAGIAN 1: LOGIKA ANIMASI KETIK ===
    let activeTimeouts = []; 
    const sets = {
        'set-a': 'Saus Rasa Stroberi, Whey, Susu, Tepung Terigu, Telur, Kedelai, Susu Skim Bubuk, Gula',
        'set-b': 'Bubuk Stroberi, Pewarna Sintetik Eritrosin CI. NO. 45430, Margarin Antioksidan, Pewarna Alami Beta Karoten CI. No 40800, Beta-Karoten (Sayuran) CI. NO. 75130, Pengembang, Kalsium Karbonat, Natrium, Bikarbonat, Dinatrium Dofosafat, Garam',
        'set-c': 'Lemak Total, Kolestrol, Lemak Jenuh, Protein, Karbohidrat Total, Serat Pangan, Gula, Garam',
        'set-d': '7%, 2%, 12%, 2%, 3%, 3%, ?, 2%'
    };
    
    function typeWriter(elementId, text, onComplete) {
        const element = document.getElementById(elementId);
        if (!element) return;
        element.classList.add('typing-cursor');
        let i = 0;
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                const timeoutId = setTimeout(type, 20);
                activeTimeouts.push(timeoutId);
            } else {
                element.classList.remove('typing-cursor');
                if (onComplete) onComplete();
            }
        }
        type();
    }

    function startTypingSequence() {
        typeWriter('set-a', sets['set-a'], () => {
            typeWriter('set-b', sets['set-b'], () => {
                typeWriter('set-c', sets['set-c'], () => {
                    typeWriter('set-d', sets['set-d'], null);
                });
            });
        });
    }
    setTimeout(startTypingSequence, 500); 

    function resetTypingAnimation() {
        activeTimeouts.forEach(id => clearTimeout(id));
        activeTimeouts = []; 
        
        const typeIds = ['set-a', 'set-b', 'set-c', 'set-d', 'example-typewriter'];
        typeIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.innerHTML = '';
                el.classList.remove('typing-cursor');
            }
        });

        isExampleTyped = false;

        setTimeout(startTypingSequence, 100);
    }
    // -------------------------

    // === BAGIAN 2: LOGIKA DIAGRAM 1 (PANAH) ===
    const showDiagramBtn = document.getElementById('show-diagram-btn');
    const diagramSection = document.getElementById('diagram-section');
    const nutrisiList = document.getElementById('nutrisi-list');
    const akgList = document.getElementById('akg-list');
    const canvas = document.getElementById('relation-canvas');
    const ctx = canvas.getContext('2d');
    const nutritionData = [
        { nutrient: 'Lemak Total', akg: '7%', color: '#e74c3c' },
        { nutrient: 'Kolestrol', akg: '2%', color: '#f1c40f' },
        { nutrient: 'Lemak Jenuh', akg: '12%', color: '#e67e22' },
        { nutrient: 'Protein', akg: '2%', color: '#8e44ad' },
        { nutrient: 'Karbohidrat Total', akg: '3%', color: '#2ecc71' },
        { nutrient: 'Serat Pangan', akg: '3%', color: '#1abc9c' },
        { nutrient: 'Gula', akg: '', color: '#ffffff' },
        { nutrient: 'Garam', akg: '2%', color: '#27ae60' }
    ];
    const uniqueAkgValues = [...new Set(nutritionData.map(item => item.akg).filter(akg => akg !== ''))];
    const sortedAkgData = uniqueAkgValues.sort((a, b) => parseInt(b) - parseInt(a));
    let isDiagramDrawn = false;
    function populateLists() {
        nutrisiList.innerHTML = '';
        akgList.innerHTML = '';
        nutritionData.forEach((item, index) => { const li = document.createElement('li'); li.textContent = item.nutrient; li.id = `nutrisi-${index}`; nutrisiList.appendChild(li); });
        sortedAkgData.forEach((item, index) => { const li = document.createElement('li'); li.textContent = item; li.id = `akg-${index}`; akgList.appendChild(li); });
    }
    populateLists();
    showDiagramBtn.addEventListener('click', () => {
        const isVisible = diagramSection.classList.toggle('visible');
        if (isVisible) {
            showDiagramBtn.textContent = 'Sembunyikan Diagram Panah Pertama';
            setTimeout(() => { diagramSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            if (!isDiagramDrawn) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                setTimeout(drawAnimatedLines, 800);
                isDiagramDrawn = true;
            }
        } else {
            showDiagramBtn.textContent = 'Diagram Panah Pertama';
            isDiagramDrawn = false;
        }
    });
    function drawAnimatedLines() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const points = nutritionData.map((item, index) => {
            if (!item.akg) return null;
            const nutrisiEl = document.getElementById(`nutrisi-${index}`);
            const akgIndex = sortedAkgData.indexOf(item.akg);
            const akgEl = document.getElementById(`akg-${akgIndex}`);
            if (!nutrisiEl || !akgEl) return null;
            const canvasRect = canvas.getBoundingClientRect();
            return {
                startX: nutrisiEl.getBoundingClientRect().right - canvasRect.left,
                startY: nutrisiEl.getBoundingClientRect().top + nutrisiEl.offsetHeight / 2 - canvasRect.top,
                endX: akgEl.getBoundingClientRect().left - canvasRect.left,
                endY: akgEl.getBoundingClientRect().top + akgEl.offsetHeight / 2 - canvasRect.top,
                color: item.color
            };
        }).filter(p => p !== null);
        let completedLines = [];
        function animateSingleLine(connection, onComplete) {
            let progress = 0; let startTime = null; const duration = 400;
            function animate(time) {
                if (!startTime) startTime = time;
                const elapsed = time - startTime;
                progress = Math.min(elapsed / duration, 1);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                completedLines.forEach(p => { ctx.beginPath(); ctx.moveTo(p.startX, p.startY); ctx.lineTo(p.endX, p.endY); ctx.strokeStyle = p.color; ctx.lineWidth = 3; ctx.stroke(); });
                ctx.beginPath();
                ctx.moveTo(connection.startX, connection.startY);
                ctx.lineTo(connection.startX + (connection.endX - connection.startX) * progress, connection.startY + (connection.endY - connection.startY) * progress);
                ctx.strokeStyle = connection.color; ctx.lineWidth = 3; ctx.stroke();
                if (progress < 1) { requestAnimationFrame(animate); } else { onComplete(); }
            }
            requestAnimationFrame(animate);
        }
        function drawSequentially(index = 0) {
            if (index >= points.length) return;
            animateSingleLine(points[index], () => { completedLines.push(points[index]); drawSequentially(index + 1); });
        }
        drawSequentially(0);
    }

    // === BAGIAN 3: LOGIKA DIAGRAM 2 (PANAH) ===
    const showDiagram2Btn = document.getElementById('show-diagram-2-btn');
    const diagramSection2 = document.getElementById('diagram-section-2');
    const bahanAlamiList = document.getElementById('bahan-alami-list');
    const nutrisiList2 = document.getElementById('nutrisi-list-2');
    const canvas2 = document.getElementById('relation-canvas-2');
    const ctx2 = canvas2.getContext('2d');
    let isDiagram2Drawn = false;
    const bahanProteinData = ['Whey', 'Susu', 'Telur', 'Kedelai', 'Susu Skim Bubuk'];
    const nutrisiProteinData = ['Protein'];
    const connections2 = [
        [0, 0, '#c0392b'],
        [1, 0, '#8e44ad'],
        [2, 0, '#e67e22'],
        [3, 0, '#27ae60'],
        [4, 0, '#f1c40f']
    ];
    function populateLists2() {
        bahanAlamiList.innerHTML = '';
        nutrisiList2.innerHTML = '';
        bahanProteinData.forEach((item, index) => { const li = document.createElement('li'); li.textContent = item; li.id = `bahan-2-${index}`; bahanAlamiList.appendChild(li); });
        nutrisiProteinData.forEach((item, index) => { const li = document.createElement('li'); li.textContent = item; li.id = `nutrisi-2-${index}`; nutrisiList2.appendChild(li); });
    }
    populateLists2();
    showDiagram2Btn.addEventListener('click', () => {
        const isVisible = diagramSection2.classList.toggle('visible');
        if (isVisible) {
            showDiagram2Btn.textContent = 'Sembunyikan Diagram Panah Kedua';
            setTimeout(() => { diagramSection2.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            if (!isDiagram2Drawn) {
                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                setTimeout(drawAnimatedLines2, 800);
                isDiagram2Drawn = true;
            }
        } else {
            showDiagram2Btn.textContent = 'Diagram Panah Kedua';
            isDiagram2Drawn = false;
        }
    });
    function drawAnimatedLines2() {
        canvas2.width = canvas2.offsetWidth;
        canvas2.height = canvas2.offsetHeight;
        const points = connections2.map(([bahanIndex, nutrisiIndex, color]) => {
            const bahanEl = document.getElementById(`bahan-2-${bahanIndex}`);
            const nutrisiEl = document.getElementById(`nutrisi-2-${nutrisiIndex}`);
            if (!bahanEl || !nutrisiEl) return null;
            const canvasRect = canvas2.getBoundingClientRect();
            return {
                startX: bahanEl.getBoundingClientRect().right - canvasRect.left,
                startY: bahanEl.getBoundingClientRect().top + bahanEl.offsetHeight / 2 - canvasRect.top,
                endX: nutrisiEl.getBoundingClientRect().left - canvasRect.left,
                endY: nutrisiEl.getBoundingClientRect().top + nutrisiEl.offsetHeight / 2 - canvasRect.top,
                color: color
            };
        }).filter(p => p !== null);
        let completedLines = [];
        function animateSingleLine(connection, onComplete) {
            let progress = 0; let startTime = null; const duration = 400;
            function animate(time) {
                if (!startTime) startTime = time;
                const elapsed = time - startTime;
                progress = Math.min(elapsed / duration, 1);
                ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
                completedLines.forEach(p => { ctx2.beginPath(); ctx2.moveTo(p.startX, p.startY); ctx2.lineTo(p.endX, p.endY); ctx2.strokeStyle = p.color; ctx2.lineWidth = 3; ctx2.stroke(); });
                ctx2.beginPath();
                ctx2.moveTo(connection.startX, connection.startY);
                ctx2.lineTo(connection.startX + (connection.endX - connection.startX) * progress, connection.startY + (connection.endY - connection.startY) * progress);
                ctx2.strokeStyle = connection.color; ctx2.lineWidth = 3; ctx2.stroke();
                if (progress < 1) { requestAnimationFrame(animate); } else { onComplete(); }
            }
            requestAnimationFrame(animate);
        }
        function drawSequentially(index = 0) {
            if (index >= points.length) return;
            animateSingleLine(points[index], () => { completedLines.push(points[index]); drawSequentially(index + 1); });
        }
        drawSequentially(0);
    }
    
    // === BAGIAN 4: LOGIKA POP-UP KREDIT & KEYBOARD ===
    const watermark = document.getElementById('watermark');
    const creditsModal = document.getElementById('credits-modal');
    const closeCreditsBtn = document.getElementById('close-credits');

    // Ambil semua tombol untuk hotkey
    const showCartesian1Btn = document.getElementById('show-cartesian-1-btn');
    const showCartesian2Btn = document.getElementById('show-cartesian-2-btn');
    const showExamplesBtn = document.getElementById('show-examples-btn'); 
    const showImageBtn = document.getElementById('show-image-btn'); // <-- Tombol baru

    watermark.addEventListener('click', () => {
        creditsModal.classList.add('visible');
    });

    closeCreditsBtn.addEventListener('click', () => {
        creditsModal.classList.remove('visible');
    });

    creditsModal.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
            creditsModal.classList.remove('visible');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        if (e.key === 'Escape') {
            creditsModal.classList.toggle('visible');
        }
        if (e.key === 'f' || e.key === 'F') {
            toggleMusic();
        }
        if (e.key === 'r' || e.key === 'R') {
            resetTypingAnimation(); 
        }
        if (e.key === '1') {
            showDiagramBtn.click(); 
        }
        if (e.key === '2') {
            showDiagram2Btn.click(); 
        }
        if (e.key === '3') {
            showCartesian1Btn.click(); 
        }
        if (e.key === '4') {
            showCartesian2Btn.click(); 
        }
        if (e.key === '5') {
            showExamplesBtn.click(); 
        }
        // === TAMBAHAN HOTKEY BARU (6) ===
        if (e.key === '6') {
            showImageBtn.click(); // Panggil klik tombol Gambar
        }
        // =======================================
    });


    // === FUNGSI ANIMASI TITIK KARTESIUS ===
    function animatePointsSequentially(ctx, points, index) {
        if (index >= points.length) return;

        const p = points[index];

        if (index > 0) {
            const p_prev = points[index - 1];
            ctx.beginPath();
            ctx.moveTo(p_prev.x, p_prev.y);
            ctx.lineTo(p.x, p.y);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'; 
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, 2 * Math.PI);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.strokeStyle = '#ffffff'; 
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const timeoutId = setTimeout(() => animatePointsSequentially(ctx, points, index + 1), 300);
        activeTimeouts.push(timeoutId); 
    }
    // ======================================


    // === BAGIAN 5: LOGIKA KARTESIUS 1 (C ke D) ===
    const cartesianSection1 = document.getElementById('cartesian-section-1');
    const canvasCartesian1 = document.getElementById('cartesian-canvas-1');
    const ctxCartesian1 = canvasCartesian1.getContext('2d');
    let isCartesian1Drawn = false;

    showCartesian1Btn.addEventListener('click', () => {
        const isVisible = cartesianSection1.classList.toggle('visible');
        if (isVisible) {
            showCartesian1Btn.textContent = 'Sembunyikan Kartesius Pertama';
            setTimeout(() => { cartesianSection1.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            if (!isCartesian1Drawn) {
                ctxCartesian1.clearRect(0, 0, canvasCartesian1.width, canvasCartesian1.height);
                const points = drawCartesianGrid1(); 
                animatePointsSequentially(ctxCartesian1, points, 0); 
                isCartesian1Drawn = true;
            }
        } else {
            showCartesian1Btn.textContent = 'Diagram Kartesius Pertama';
            isCartesian1Drawn = false; 
        }
    });

    function drawCartesianGrid1() {
        canvasCartesian1.width = canvasCartesian1.offsetWidth;
        canvasCartesian1.height = canvasCartesian1.offsetHeight;
        
        const padding = 80; 
        const xOrigin = padding;
        const yOrigin = canvasCartesian1.height - padding;
        const graphWidth = canvasCartesian1.width - padding * 2;
        const graphHeight = canvasCartesian1.height - padding * 2;

        const xLabels = nutritionData.map(item => item.nutrient);
        const yLabels = sortedAkgData;
        const xStep = graphWidth / xLabels.length;
        const yStep = graphHeight / yLabels.length;

        ctxCartesian1.fillStyle = '#ffffff';
        ctxCartesian1.strokeStyle = 'rgba(255, 255, 255, 0.4)'; 
        ctxCartesian1.font = '12px Poppins';
        ctxCartesian1.lineWidth = 1;

        ctxCartesian1.beginPath();
        ctxCartesian1.moveTo(xOrigin, padding - 20);
        ctxCartesian1.lineTo(xOrigin, yOrigin);
        ctxCartesian1.strokeStyle = '#ffffff'; 
        ctxCartesian1.stroke();
        ctxCartesian1.fillText('% AKG (D)', xOrigin - 60, padding - 30);

        ctxCartesian1.beginPath();
        ctxCartesian1.moveTo(xOrigin, yOrigin);
        ctxCartesian1.lineTo(xOrigin + graphWidth + 20, yOrigin);
        ctxCartesian1.strokeStyle = '#ffffff'; 
        ctxCartesian1.stroke();
        ctxCartesian1.fillText('Nutrisi (C)', xOrigin + graphWidth - 20, yOrigin + 40);

        ctxCartesian1.strokeStyle = 'rgba(255, 255, 255, 0.4)'; 
        yLabels.forEach((label, i) => {
            const y = yOrigin - (i + 0.5) * yStep;
            ctxCartesian1.fillText(label, xOrigin - 30, y + 4);
            ctxCartesian1.beginPath();
            ctxCartesian1.moveTo(xOrigin + 5, y); 
            ctxCartesian1.lineTo(xOrigin + graphWidth, y);
            ctxCartesian1.stroke();
        });

        xLabels.forEach((label, i) => {
            const x = xOrigin + (i + 0.5) * xStep;
            ctxCartesian1.save();
            ctxCartesian1.translate(x, yOrigin + 10);
            ctxCartesian1.rotate(-Math.PI / 4); 
            ctxCartesian1.fillText(label, 0, 0);
            ctxCartesian1.restore();
            ctxCartesian1.beginPath();
            ctxCartesian1.moveTo(x, yOrigin - 5); 
            ctxCartesian1.lineTo(x, padding);
            ctxCartesian1.stroke();
        });

        const pointsToDraw = nutritionData.map(item => {
            if (!item.akg) return null; 
            const xIndex = xLabels.indexOf(item.nutrient);
            const yIndex = yLabels.indexOf(item.akg);
            const x = xOrigin + (xIndex + 0.5) * xStep;
            const y = yOrigin - (yIndex + 0.5) * yStep;
            return { x, y, color: item.color };
        }).filter(p => p !== null); 
        
        return pointsToDraw; 
    }


    // === BAGIAN 6: LOGIKA KARTESIUS 2 (A ke C) ===
    const cartesianSection2 = document.getElementById('cartesian-section-2');
    const canvasCartesian2 = document.getElementById('cartesian-canvas-2');
    const ctxCartesian2 = canvasCartesian2.getContext('2d');
    let isCartesian2Drawn = false;

    showCartesian2Btn.addEventListener('click', () => {
        const isVisible = cartesianSection2.classList.toggle('visible');
        if (isVisible) {
            showCartesian2Btn.textContent = 'Sembunyikan Kartesius Kedua';
            setTimeout(() => { cartesianSection2.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
            if (!isCartesian2Drawn) {
                ctxCartesian2.clearRect(0, 0, canvasCartesian2.width, canvasCartesian2.height);
                const points = drawCartesianGrid2(); 
                animatePointsSequentially(ctxCartesian2, points, 0); 
                isCartesian2Drawn = true;
            }
        } else {
            showCartesian2Btn.textContent = 'Diagram Kartesius Kedua';
            isCartesian2Drawn = false;
        }
    });

    function drawCartesianGrid2() {
        canvasCartesian2.width = canvasCartesian2.offsetWidth;
        canvasCartesian2.height = canvasCartesian2.offsetHeight;
        
        const padding = 80;
        const xOrigin = padding;
        const yOrigin = canvasCartesian2.height - padding;
        const graphWidth = canvasCartesian2.width - padding * 2;
        const graphHeight = canvasCartesian2.height - padding * 2;

        const xLabels = bahanProteinData; 
        const yLabels = nutrisiProteinData;
        const xStep = graphWidth / xLabels.length;
        const yStep = graphHeight / yLabels.length; 

        ctxCartesian2.fillStyle = '#ffffff';
        ctxCartesian2.strokeStyle = 'rgba(255, 255, 255, 0.4)'; 
        ctxCartesian2.font = '12px Poppins';
        ctxCartesian2.lineWidth = 1;

        ctxCartesian2.beginPath();
        ctxCartesian2.moveTo(xOrigin, padding - 20);
        ctxCartesian2.lineTo(xOrigin, yOrigin);
        ctxCartesian2.strokeStyle = '#ffffff'; 
        ctxCartesian2.stroke();
        ctxCartesian2.fillText('Nutrisi (C)', xOrigin - 70, padding - 30);

        ctxCartesian2.beginPath();
        ctxCartesian2.moveTo(xOrigin, yOrigin);
        ctxCartesian2.lineTo(xOrigin + graphWidth + 20, yOrigin);
        ctxCartesian2.strokeStyle = '#ffffff'; 
        ctxCartesian2.stroke();
        ctxCartesian2.fillText('Bahan Alami (A)', xOrigin + graphWidth - 60, yOrigin + 40);

        ctxCartesian2.strokeStyle = 'rgba(255, 255, 255, 0.4)'; 
        yLabels.forEach((label, i) => {
            const y = yOrigin - (i + 0.5) * yStep;
            ctxCartesian2.fillText(label, xOrigin - 50, y + 4);
            ctxCartesian2.beginPath();
            ctxCartesian2.moveTo(xOrigin + 5, y);
            ctxCartesian2.lineTo(xOrigin + graphWidth, y);
            ctxCartesian2.stroke();
        });

        xLabels.forEach((label, i) => {
            const x = xOrigin + (i + 0.5) * xStep;
            ctxCartesian2.save();
            ctxCartesian2.translate(x, yOrigin + 10);
            ctxCartesian2.rotate(-Math.PI / 4);
            ctxCartesian2.fillText(label, 0, 0);
            ctxCartesian2.restore();
            ctxCartesian2.beginPath();
            ctxCartesian2.moveTo(x, yOrigin - 5);
            ctxCartesian2.lineTo(x, padding);
            ctxCartesian2.stroke();
        });

        const pointsToDraw = connections2.map(conn => {
            const [bahanIndex, nutrisiIndex, color] = conn;
            const x = xOrigin + (bahanIndex + 0.5) * xStep;
            const y = yOrigin - (nutrisiIndex + 0.5) * yStep;
            return { x, y, color };
        });

        return pointsToDraw; 
    }

    
    // === BAGIAN 7: LOGIKA CONTOH KEHIDUPAN SEHARI-HARI ===
    const examplesSection = document.getElementById('examples-section');
    // 'showExamplesBtn' sudah didefinisikan di Bagian 4

    showExamplesBtn.addEventListener('click', () => {
        const isVisible = examplesSection.classList.toggle('visible');
        if (isVisible) {
            showExamplesBtn.textContent = 'Sembunyikan Contoh';
            setTimeout(() => { examplesSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);

            if (!isExampleTyped) {
                // Teks sesuai permintaan terakhir Anda
                const exampleText = "Ini membantu kita untuk melihat komposisi makanan. Jika kita alergi, kita jadi tahu komposisi mana yang harus dihindari.";
                
                typeWriter('example-typewriter', exampleText, null); 
                isExampleTyped = true; 
            }
        } else {
            showExamplesBtn.textContent = 'Contoh Kehidupan Sehari-hari';
        }
    });
    // ========================================================


    const imageSection = document.getElementById('image-section');
    // 'showImageBtn' sudah didefinisikan di Bagian 4
    
    showImageBtn.addEventListener('click', () => {
        const isVisible = imageSection.classList.toggle('visible');
        if (isVisible) {
            showImageBtn.textContent = 'Sembunyikan Gambar';
            setTimeout(() => { imageSection.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
        } else {
            showImageBtn.textContent = 'Tampilkan Gambar';
        }
    });
    // ===========================================

});