/**
 * Amsilati App - Core Logic
 * v2 — Fixed back button history + offline sync
 * v3 — Direct CSV fetch from published Google Sheets
 */

const CONF = {
    MATERI_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSUnqD27WNzOFMd6Z-BzrY3QiOReB5Ztlbwun6vlJfV-jDtVy1MjySTeN-346eGATBOEJ2N4xvqgfhi/pub?gid=0&single=true&output=csv',
    QUIZ_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQa_C6bN5pZMttRNAoYNyGf0Wzbajqlb5fBKIlK-sC94GjcbEjtO0w8ISTI3ZeHwHfPq2chO7zhywId/pub?gid=0&single=true&output=csv',
    HAFALAN_PDF_API: '/api/hafalan.pdf',    // server proxy (Google Drive, always latest)
    HAFALAN_PDF_LOCAL: 'assets/hafalan.pdf', // local fallback (offline/no proxy)
    DATA_KEY: 'amsilati_data',
    LAST_SYNC_KEY: 'amsilati_last_sync',
    SYNC_INTERVAL: 5 * 60 * 1000 // 5 minutes
};

/**
 * Simple Markdown Parser Helper
 */
function parseMateriMarkdown(text) {
    if (!text) return '';
    let html = text;

    // Support Arabic block syntax: ```arab ... ``` or [[arab]] ... [[/arab]]
    // but the main way will be HTML in spreadsheet, or wrapping with arab markers.
    html = html.replace(/\[\[arab\]\]([\s\S]*?)\[\[\/arab\]\]/g, '<div class="arabic-text">$1</div>');

    // Headers (Map # and ## to <h2>, ### to <h3>)
    html = html.replace(/^###\s+(.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.*$)/gim, '<h2>$1</h2>');

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr style="border:0; border-top:1px dashed #ccc; margin:20px 0;">');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

    // Newlines to <br>
    html = html.replace(/\n/g, '<br>');

    // Clean up excessive <br> around block elements to avoid huge gaps
    html = html.replace(/(<\/h2>|<\/h3>|<\/div>|<hr[^>]*>)<br>\s*<br>/gi, '$1<br>');
    html = html.replace(/<br>\s*(<h2>|<h3>|<hr|<div class="arabic-text")/gi, '\n$1');

    return html;
}

/**
 * Parse CSV text into an array of objects.
 * Handles quoted fields with commas and newlines inside.
 */
function parseCSV(csvText) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let inQuotes = false;

    for (let i = 0; i < csvText.length; i++) {
        const ch = csvText[i];
        const next = csvText[i + 1];

        if (inQuotes) {
            if (ch === '"' && next === '"') {
                currentField += '"';
                i++; // skip escaped quote
            } else if (ch === '"') {
                inQuotes = false;
            } else {
                currentField += ch;
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
            } else if (ch === ',') {
                currentRow.push(currentField.trim());
                currentField = '';
            } else if (ch === '\r' && next === '\n') {
                currentRow.push(currentField.trim());
                if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
                currentRow = [];
                currentField = '';
                i++; // skip \n
            } else if (ch === '\n') {
                currentRow.push(currentField.trim());
                if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
                currentRow = [];
                currentField = '';
            } else {
                currentField += ch;
            }
        }
    }

    // Last field/row
    if (currentField || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.length > 1 || currentRow[0] !== '') rows.push(currentRow);
    }

    if (rows.length < 2) return [];

    const headers = rows[0].map(h => h.toLowerCase().replace(/\s+/g, '_'));
    const result = [];

    for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        // Skip rows with significantly fewer columns (likely invalid)
        if (row.length < headers.length / 2) continue;

        const obj = {};
        headers.forEach((header, idx) => {
            let val = row[idx] !== undefined ? row[idx] : '';
            // Convert numeric strings for jilid, urutan, nomor
            if (['jilid', 'urutan', 'nomor'].includes(header) && val !== '') {
                const num = Number(val);
                if (!isNaN(num)) val = num;
            }
            obj[header] = val;
        });
        // Only include active rows (status = TRUE or truthy)
        if (obj.status === 'FALSE' || obj.status === false) continue;
        result.push(obj);
    }

    return result;
}

/**
 * Fetch CSV from a published Google Sheet and parse to JSON array.
 */
async function fetchSheetCSV(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const text = await response.text();
    return parseCSV(text);
}

const app = {
    data: {
        materi: [],
        quiz: []
    },
    state: {
        currentView: 'home',
        currentType: null,    // 'materi' or 'quiz' — which mode jilid-select is in
        currentJilid: null,   // which jilid is selected
        currentMateri: null,  // which materi item is being viewed
        currentQuiz: null,
        quizAnswers: {},
        quizScore: 0,
        quizIndex: 0,
        syncTimer: null,
        // PDF State
        pdfState: {
            pdfDoc: null,
            pageNum: 1,
            pageRendering: false,
            pageNumPending: null,
            scale: 1.0,
            baseScale: null,
            canvas: null,
            ctx: null
        }
    },

    // ─── NAVIGATION HISTORY ──────────────────────
    // We use the browser History API so Android's hardware back button
    // fires a 'popstate' event. Every navigation pushes state; every
    // back action pops it. Both in-app "←" buttons and the HW back
    // button call the same handler = no ping-pong bug.

    /**
     * Push a new navigation state into browser history.
     * @param {string} view - the view id (e.g. 'home', 'jilid-select', 'materi-list')
     * @param {object} ctx  - extra context like { type, jilid, materi }
     */
    pushState: (view, ctx = {}) => {
        const stateObj = { view, ...ctx };
        history.pushState(stateObj, '', '');
        app.state.currentView = view;
    },

    /**
     * Replace the current history entry (used for initial home state).
     */
    replaceState: (view, ctx = {}) => {
        const stateObj = { view, ...ctx };
        history.replaceState(stateObj, '', '');
        app.state.currentView = view;
    },

    /**
     * Central method to show a specific view section.
     * Hides all views, activates the given one.
     */
    showView: (viewId) => {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(`view-${viewId}`).classList.add('active');
        window.scrollTo(0, 0);
    },

    /**
     * Called when Android HW back or browser back is pressed.
     * The 'popstate' event gives us the PREVIOUS state object.
     */
    handlePopState: (event) => {
        const state = event.state;

        // Close drawer if open
        const drawer = document.getElementById('drawer');
        if (drawer.classList.contains('open')) {
            drawer.classList.remove('open');
            document.getElementById('drawer-backdrop').classList.remove('visible');
            // Re-push current state so we don't actually navigate back
            app.pushState(app.state.currentView, app._getCurrentCtx());
            return;
        }

        if (!state || state.view === 'home') {
            // We're at home — show home
            app.state.currentView = 'home';
            app.showView('home');
            return;
        }

        // Restore the view from the popped state
        const view = state.view;
        app.state.currentView = view;

        switch (view) {
            case 'home':
                app.showView('home');
                break;

            case 'jilid-select':
                app.state.currentType = state.type;
                app.renderJilidList(state.type);
                app.showView('jilid-select');
                break;

            case 'materi-list':
                app.state.currentType = state.type;
                app.state.currentJilid = state.jilid;
                app._renderMateriListContent(state.jilid);
                app.showView('materi-list');
                break;

            case 'materi-detail':
                if (state.materiItem) {
                    app.state.currentMateri = state.materiItem;
                    document.getElementById('materi-detail-title').textContent = state.materiItem.judul;
                    let content = state.materiItem.konten_md || '';
                    document.getElementById('materi-content').innerHTML = parseMateriMarkdown(content);
                }
                app.showView('materi-detail');
                break;

            case 'hafalan':
                app.showView('hafalan');
                app.initPdf();
                break;

            case 'quiz-runner':
                // If user backs out of quiz, go to jilid-select instead
                app.state.currentQuiz = null;
                app.state.currentType = 'quiz';
                app.renderJilidList('quiz');
                app.showView('jilid-select');
                break;

            case 'quiz-result':
                if (app.state.currentQuiz) {
                    app.showView('quiz-result');
                } else {
                    app.showView('home');
                }
                break;

            case 'quiz-review':
                if (app.state.currentQuiz) {
                    app.showView('quiz-result');
                } else {
                    app.showView('home');
                }
                break;

            default:
                app.showView('home');
        }
    },

    /**
     * Get current context for re-pushing state (e.g. after closing drawer).
     */
    _getCurrentCtx: () => {
        return {
            type: app.state.currentType,
            jilid: app.state.currentJilid,
            materiItem: app.state.currentMateri
        };
    },

    /**
     * Unified back function called by all in-app "←" back buttons.
     * This simply uses history.back() so it triggers popstate,
     * which is handled by handlePopState — guaranteeing identical
     * behavior with the hardware back button.
     */
    goBack: () => {
        history.back();
    },

    // ─── INIT ──────────────────────

    init: async () => {
        // Set initial state in browser history
        app.replaceState('home');

        // Listen for back button (Android HW + browser)
        window.addEventListener('popstate', app.handlePopState);

        app.setupNavigation();
        app.loadData();

        // Check for updates if online
        if (navigator.onLine) {
            app.checkForUpdates();
        }

        // Listen for connectivity changes
        window.addEventListener('online', () => {
            console.log('Device is online — syncing...');
            app.checkForUpdates();
            app.startAutoSync();
        });

        window.addEventListener('offline', () => {
            console.log('Device is offline');
            app.stopAutoSync();
        });

        // Start periodic sync if online
        if (navigator.onLine) {
            app.startAutoSync();
        }

        setTimeout(() => {
            document.getElementById('splash-screen').style.display = 'none';
            document.getElementById('app').style.display = 'block';
        }, 2000);
    },

    setupNavigation: () => {
        // Drawer
        const drawer = document.getElementById('drawer');
        const overlay = document.getElementById('drawer-backdrop');

        document.getElementById('menu-btn').onclick = () => {
            drawer.classList.add('open');
            overlay.classList.add('visible');
        };

        const closeDrawer = () => {
            drawer.classList.remove('open');
            overlay.classList.remove('visible');
        };

        document.getElementById('close-drawer').onclick = closeDrawer;
        overlay.onclick = closeDrawer;

        // Sync Button
        document.getElementById('sync-btn').onclick = app.forceSync;
    },

    // ─── DATA LOADING & SYNC ──────────────────────

    loadData: () => {
        const stored = localStorage.getItem(CONF.DATA_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            app.data = parsed;
            const lastSync = localStorage.getItem(CONF.LAST_SYNC_KEY);
            if (lastSync) {
                document.getElementById('last-updated').textContent = `Terakhir sync: ${new Date(parseInt(lastSync)).toLocaleString('id-ID')}`;
            } else {
                document.getElementById('last-updated').textContent = `Data tersedia (offline)`;
            }
        } else {
            // First time load — force sync
            app.forceSync();
        }
    },

    /**
     * Fetch both Materi and Quiz CSV from published Google Sheets.
     * Returns { materi: [...], quiz: [...] } or throws.
     */
    fetchAllData: async () => {
        const [materi, quiz] = await Promise.all([
            fetchSheetCSV(CONF.MATERI_CSV_URL),
            fetchSheetCSV(CONF.QUIZ_CSV_URL)
        ]);
        return { materi, quiz, version: new Date().toISOString() };
    },

    /**
     * Manual sync — shows feedback to user via alert.
     */
    forceSync: async () => {
        const btn = document.getElementById('sync-btn');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="sync-spinner">⟳</span> Syncing...';
        btn.disabled = true;

        try {
            const newData = await app.fetchAllData();

            // Validate
            if (!newData.materi.length && !newData.quiz.length) throw new Error('Data kosong');

            localStorage.setItem(CONF.DATA_KEY, JSON.stringify(newData));
            localStorage.setItem(CONF.LAST_SYNC_KEY, Date.now().toString());
            app.data = newData;

            document.getElementById('last-updated').textContent = `Terakhir sync: ${new Date().toLocaleString('id-ID')}`;
            console.log(`Data berhasil diperbarui: ${newData.materi.length} materi, ${newData.quiz.length} soal quiz.`);
        } catch (e) {
            console.error('Sync error:', e);
            if (!navigator.onLine) {
                alert('Tidak ada koneksi internet.\nMenggunakan data tersimpan.');
            } else {
                alert('Gagal mengambil data: ' + e.message + '\nMenggunakan data tersimpan.');
            }
            // Fallback to mock data if nothing stored
            if (app.data.materi.length === 0) {
                try {
                    const mock = await fetch('data/mock.json');
                    app.data = await mock.json();
                    localStorage.setItem(CONF.DATA_KEY, JSON.stringify(app.data));
                } catch (err) { }
            }
        } finally {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    },

    /**
     * Background auto-sync — silent, no alert.
     * Fetches fresh data and updates if changed.
     */
    checkForUpdates: async () => {
        console.log('Checking for updates from Google Sheets...');
        try {
            const newData = await app.fetchAllData();

            if (!newData.materi.length && !newData.quiz.length) return;

            // Compare with existing data (ignore version timestamp)
            const currentRaw = localStorage.getItem(CONF.DATA_KEY);
            const currentParsed = currentRaw ? JSON.parse(currentRaw) : null;

            const currentMateriRaw = JSON.stringify(currentParsed?.materi || []);
            const currentQuizRaw = JSON.stringify(currentParsed?.quiz || []);
            const newMateriRaw = JSON.stringify(newData.materi);
            const newQuizRaw = JSON.stringify(newData.quiz);

            if (currentMateriRaw !== newMateriRaw || currentQuizRaw !== newQuizRaw) {
                console.log('New data detected, updating...');
                localStorage.setItem(CONF.DATA_KEY, JSON.stringify(newData));
                localStorage.setItem(CONF.LAST_SYNC_KEY, Date.now().toString());
                app.data = newData;
                document.getElementById('last-updated').textContent = `Terakhir sync: ${new Date().toLocaleString('id-ID')}`;
                console.log(`Data updated: ${newData.materi.length} materi, ${newData.quiz.length} quiz.`);
            } else {
                console.log('Data is up to date.');
            }
        } catch (e) {
            console.log('Background sync failed (offline or error):', e.message);
        }
    },

    startAutoSync: () => {
        app.stopAutoSync(); // Clear any existing timer
        app.state.syncTimer = setInterval(() => {
            if (navigator.onLine) {
                app.checkForUpdates();
            }
        }, CONF.SYNC_INTERVAL);
    },

    stopAutoSync: () => {
        if (app.state.syncTimer) {
            clearInterval(app.state.syncTimer);
            app.state.syncTimer = null;
        }
    },

    // ─── NAVIGATION ──────────────────────

    /**
     * Main navigation method.
     * Every navigation action pushes to browser history.
     */
    navigate: (viewId) => {
        if (viewId === 'materi') {
            app.state.currentType = 'materi';
            app.renderJilidList('materi');
            app.showView('jilid-select');
            app.pushState('jilid-select', { type: 'materi' });

        } else if (viewId === 'quiz') {
            app.state.currentType = 'quiz';
            app.renderJilidList('quiz');
            app.showView('jilid-select');
            app.pushState('jilid-select', { type: 'quiz' });

        } else if (viewId === 'hafalan') {
            app.showView('hafalan');
            app.pushState('hafalan');
            app.initPdf();

        } else {
            app.showView(viewId);
            app.pushState(viewId);
        }
    },

    goHome: () => {
        // Pop all history back to home
        app.showView('home');
        app.state.currentView = 'home';
        app.state.currentType = null;
        app.state.currentJilid = null;
        app.state.currentMateri = null;
        // Replace state to home to avoid stacking
        app.replaceState('home');
    },

    // ─── MATERI LOGIC ──────────────────────

    renderJilidList: (type) => {
        const container = document.getElementById('jilid-list-container');
        container.innerHTML = '';
        document.getElementById('jilid-select-title').textContent = type === 'materi' ? 'Pilih Jilid Materi' : 'Pilih Jilid Quiz';

        [1, 2, 3, 4, 5].forEach(jilid => {
            const div = document.createElement('div');
            div.className = 'jilid-item';
            div.innerHTML = `<h3>Jilid ${jilid}</h3>`;
            div.onclick = () => {
                if (type === 'materi') app.openMateriList(jilid);
                else app.startQuiz(jilid);
            };
            container.appendChild(div);
        });
    },

    openMateriList: (jilid) => {
        app.state.currentJilid = jilid;
        app._renderMateriListContent(jilid);
        app.showView('materi-list');
        app.pushState('materi-list', { type: 'materi', jilid: jilid });
    },

    /**
     * Internal helper to populate the materi list DOM.
     * Separated from openMateriList so popstate can also call it.
     */
    _renderMateriListContent: (jilid) => {
        const list = app.data.materi.filter(m => m.jilid == jilid).sort((a, b) => a.urutan - b.urutan);
        const container = document.getElementById('materi-list-container');
        container.innerHTML = '';
        document.getElementById('materi-list-title').textContent = `Materi Jilid ${jilid}`;

        if (list.length === 0) {
            container.innerHTML = '<p style="text-align:center; padding:20px;">Belum ada materi.</p>';
        }

        list.forEach(item => {
            const div = document.createElement('div');
            div.className = 'list-item';
            div.innerHTML = `<h4>${item.judul}</h4>`;
            div.onclick = () => app.openMateriDetail(item);
            container.appendChild(div);
        });

        // Search handler
        const searchInput = document.getElementById('materi-search');
        searchInput.value = ''; // Reset search
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            Array.from(container.children).forEach(el => {
                const text = el.textContent.toLowerCase();
                el.style.display = text.includes(term) ? 'block' : 'none';
            });
        };
    },

    openMateriDetail: (item) => {
        app.state.currentMateri = item;
        document.getElementById('materi-detail-title').textContent = item.judul;

        let content = item.konten_md || '';
        document.getElementById('materi-content').innerHTML = parseMateriMarkdown(content);

        app.showView('materi-detail');
        app.pushState('materi-detail', { type: 'materi', jilid: app.state.currentJilid, materiItem: item });
    },

    backToMateriList: () => {
        // Use unified back — history.back() triggers popstate
        app.goBack();
    },

    // ─── QUIZ LOGIC ──────────────────────

    startQuiz: (jilid) => {
        const questions = app.data.quiz.filter(q => q.jilid == jilid);
        if (questions.length === 0) {
            alert('Soal belum tersedia untuk jilid ini.');
            return;
        }

        app.state.currentQuiz = questions;
        app.state.quizAnswers = {};
        app.state.quizIndex = 0;

        app.showView('quiz-runner');
        app.pushState('quiz-runner', { type: 'quiz', jilid: jilid });
        app.renderQuestion();
    },

    renderQuestion: () => {
        const idx = app.state.quizIndex;
        const q = app.state.currentQuiz[idx];
        const total = app.state.currentQuiz.length;

        document.getElementById('quiz-counter').textContent = `${idx + 1} / ${total}`;
        document.getElementById('quiz-question-text').innerHTML = q.pertanyaan;

        const container = document.getElementById('quiz-options-container');
        container.innerHTML = '';

        ['A', 'B', 'C', 'D'].forEach(opt => {
            const val = q[`opsi_${opt.toLowerCase()}`];
            if (!val) return;

            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerHTML = `<b>${opt}.</b> ${val}`;
            btn.onclick = () => app.handleAnswer(opt);
            container.appendChild(btn);
        });
    },

    handleAnswer: (answer) => {
        const idx = app.state.quizIndex;
        const q = app.state.currentQuiz[idx];

        app.state.quizAnswers[q.question_id] = {
            user: answer,
            correct: q.jawaban_benar,
            isCorrect: answer === q.jawaban_benar
        };

        if (idx < app.state.currentQuiz.length - 1) {
            app.state.quizIndex++;
            app.renderQuestion();
        } else {
            app.finishQuiz();
        }
    },

    finishQuiz: () => {
        let correct = 0;
        const total = app.state.currentQuiz.length;

        Object.values(app.state.quizAnswers).forEach(a => {
            if (a.isCorrect) correct++;
        });

        const score = Math.round((correct / total) * 100);

        document.getElementById('score-display').textContent = score;
        document.getElementById('count-correct').textContent = correct;
        document.getElementById('count-wrong').textContent = total - correct;

        app.showView('quiz-result');
        app.pushState('quiz-result', { type: 'quiz' });
    },

    quitQuiz: () => {
        if (confirm('Keluar dari quiz? Progress tidak tersimpan.')) {
            app.goHome();
        }
    },

    reviewQuiz: () => {
        const container = document.getElementById('review-container');
        container.innerHTML = '';

        let hasWrong = false;

        app.state.currentQuiz.forEach((q, i) => {
            const ans = app.state.quizAnswers[q.question_id];
            if (!ans || !ans.isCorrect) {
                hasWrong = true;

                const div = document.createElement('div');
                div.className = 'review-item';

                let html = `<div class="review-question">${i + 1}. ${q.pertanyaan}</div>`;
                html += `<div class="review-answer"><span class="label-wrong">Jawabanmu: ${ans ? ans.user : '-'}</span></div>`;
                html += `<div class="review-answer"><span class="label-correct">Jawaban Benar: ${q.jawaban_benar}</span></div>`;

                if (q.pembahasan) {
                    html += `<div class="review-discussion"><strong>Pembahasan:</strong><br>${q.pembahasan}</div>`;
                }

                div.innerHTML = html;
                container.appendChild(div);
            }
        });

        if (!hasWrong) {
            container.innerHTML = '<div style="text-align:center; padding:20px;">Hebat! Semua jawaban benar.</div>';
        }

        app.showView('quiz-review');
        app.pushState('quiz-review', { type: 'quiz' });
    },

    // ─── PDF VIEWER ──────────────────────

    initPdf: async () => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const canvas = document.getElementById('the-canvas');
        app.state.pdfState.canvas = canvas;
        app.state.pdfState.ctx = canvas.getContext('2d');

        // Reset state
        app.state.pdfState.pageNum = 1;
        app.state.pdfState.baseScale = null;

        /**
         * Try loading from server proxy first (gets latest from Google Drive).
         * If that fails, fall back to local bundled copy.
         */
        let pdfDoc = null;

        try {
            // Try server proxy — fetches latest from Google Drive
            pdfDoc = await pdfjsLib.getDocument(CONF.HAFALAN_PDF_API).promise;
            console.log('PDF loaded from server proxy (Google Drive latest)');
        } catch (e) {
            console.log('Proxy failed, trying local file:', e.message);
            try {
                // Fallback to local bundled copy
                pdfDoc = await pdfjsLib.getDocument(CONF.HAFALAN_PDF_LOCAL).promise;
                console.log('PDF loaded from local file');
            } catch (e2) {
                console.error('All PDF sources failed:', e2.message);
                alert('Gagal memuat file Hafalan. Pastikan koneksi internet atau file hafalan.pdf ada.');
                return;
            }
        }

        app.state.pdfState.pdfDoc = pdfDoc;
        document.getElementById('page-count').textContent = pdfDoc.numPages;
        document.getElementById('page-num').max = pdfDoc.numPages;

        // Calculate scale to fit container width
        const page = await pdfDoc.getPage(1);
        const container = document.getElementById('pdf-container');
        const containerWidth = container.clientWidth - 20;
        const defaultViewport = page.getViewport({ scale: 1.0 });
        const fitScale = containerWidth / defaultViewport.width;

        app.state.pdfState.baseScale = fitScale;
        app.state.pdfState.scale = fitScale;

        app.renderPdfPage(1);

        // Setup Controls
        document.getElementById('prev-page').onclick = app.onPrevPage;
        document.getElementById('next-page').onclick = app.onNextPage;
        document.getElementById('zoom-in').onclick = app.onZoomIn;
        document.getElementById('zoom-out').onclick = app.onZoomOut;

        // Page jump via input
        const pageInput = document.getElementById('page-num');
        pageInput.addEventListener('change', app.onPageInput);
        pageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                pageInput.blur();
                app.onPageInput();
            }
        });
    },

    renderPdfPage: (num) => {
        app.state.pdfState.pageRendering = true;

        app.state.pdfState.pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: app.state.pdfState.scale });
            const canvas = app.state.pdfState.canvas;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: app.state.pdfState.ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            renderTask.promise.then(() => {
                app.state.pdfState.pageRendering = false;

                if (app.state.pdfState.pageNumPending !== null) {
                    app.renderPdfPage(app.state.pdfState.pageNumPending);
                    app.state.pdfState.pageNumPending = null;
                }
            });
        });

        document.getElementById('page-num').value = num;
    },

    queueRenderPage: (num) => {
        if (app.state.pdfState.pageRendering) {
            app.state.pdfState.pageNumPending = num;
        } else {
            app.renderPdfPage(num);
        }
    },

    onPrevPage: () => {
        if (app.state.pdfState.pageNum <= 1) return;
        app.state.pdfState.pageNum--;
        app.queueRenderPage(app.state.pdfState.pageNum);
    },

    onNextPage: () => {
        if (app.state.pdfState.pageNum >= app.state.pdfState.pdfDoc.numPages) return;
        app.state.pdfState.pageNum++;
        app.queueRenderPage(app.state.pdfState.pageNum);
    },

    onZoomIn: () => {
        app.state.pdfState.scale += 0.3;
        app.renderPdfPage(app.state.pdfState.pageNum);
    },

    onZoomOut: () => {
        // Don't zoom below the fit-width baseline
        const minScale = app.state.pdfState.baseScale || 0.5;
        if (app.state.pdfState.scale <= minScale) return;
        app.state.pdfState.scale = Math.max(minScale, app.state.pdfState.scale - 0.3);
        app.renderPdfPage(app.state.pdfState.pageNum);
    },

    /**
     * Handle page number input — jump to typed page.
     */
    onPageInput: () => {
        const input = document.getElementById('page-num');
        const num = parseInt(input.value, 10);
        if (!num || num < 1 || num > app.state.pdfState.pdfDoc.numPages) {
            // Reset to current page if invalid
            input.value = app.state.pdfState.pageNum;
            return;
        }
        app.goToPage(num);
    },

    goToPage: (num) => {
        app.state.pdfState.pageNum = num;
        app.queueRenderPage(num);
    }
};


// Start
document.addEventListener('DOMContentLoaded', app.init);
