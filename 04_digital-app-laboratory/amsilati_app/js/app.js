/**
 * Amsilati App - Core Logic
 */

const CONF = {
    // API_URL: 'data/mock.json', // Dev mode
    API_URL: 'https://script.google.com/macros/s/AKfycbywpatF4LkJddk9lUCR1BXaAwKrE4qGFkvSELvhwAydUWsKFJs-VTml0RkBMimr2ZzR/exec',
    VERSION_KEY: 'amsilati_version',
    DATA_KEY: 'amsilati_data'
};

const app = {
    data: {
        materi: [],
        quiz: []
    },
    state: {
        currentView: 'home',
        currentQuiz: null,
        quizAnswers: {},
        quizScore: 0,
        // PDF State
        pdfState: {
            pdfDoc: null,
            pageNum: 1,
            pageRendering: false,
            pageNumPending: null,
            scale: 1.0, // Initial zoom
            canvas: null,
            ctx: null
        }
    },

    init: async () => {
        app.setupNavigation();
        app.loadData();

        // Check for updates if online
        if (navigator.onLine) {
            // - [x] Modify `js/app.js` <!-- id: 4 -->
            // - [x] Implement PDF loading logic
            // - [x] Implement Zoom and Navigation logic
            // - [/] Verify Implementation <!-- id: 5 -->
            app.checkForUpdates();
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

    loadData: () => {
        const stored = localStorage.getItem(CONF.DATA_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            app.data = parsed;
            document.getElementById('last-updated').textContent = `Data: ${new Date(parsed.version || Date.now()).toLocaleDateString()}`;
        } else {
            // First time load (or offline without data)
            app.forceSync();
        }
    },

    forceSync: async () => {
        const btn = document.getElementById('sync-btn');
        const originalText = btn.textContent;
        btn.textContent = 'Syncing...';
        btn.disabled = true;

        try {
            const response = await fetch(CONF.API_URL);
            const newData = await response.json();

            // Validate data structure basic
            if (!newData.materi && !newData.quiz) throw new Error("Invalid Data");

            localStorage.setItem(CONF.DATA_KEY, JSON.stringify(newData));
            app.data = newData;

            document.getElementById('last-updated').textContent = `Terkini: ${new Date().toLocaleTimeString()}`;
            alert('Data berhasil diperbarui!');
        } catch (e) {
            console.error(e);
            alert('Gagal mengambil data. Pastikan internet lancar.\nMode Demo: Menggunakan data lokal.');
            // Fallback for demo if fetch fails (e.g. invalid URL)
            if (app.data.materi.length === 0) {
                // Try loading local mock if valid fetch failed
                try {
                    const mock = await fetch('data/mock.json');
                    app.data = await mock.json();
                    localStorage.setItem(CONF.DATA_KEY, JSON.stringify(app.data));
                } catch (err) { }
            }
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    },

    checkForUpdates: async () => {
        // Implementation: Fetch just version first if possible, but here we fetch all for simplicity
        // In production with huge data, separate version endpoint is better.
        console.log('Checking for updates...');
    },

    /* Navigation */
    navigate: (viewId) => {
        // Hide all views
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));

        // Handle specific logic
        if (viewId === 'materi') {
            app.renderJilidList('materi');
            document.getElementById('view-jilid-select').classList.add('active');
        } else if (viewId === 'quiz') {
            app.renderJilidList('quiz');
            document.getElementById('view-jilid-select').classList.add('active');
        } else if (viewId === 'hafalan') {
            document.getElementById('view-hafalan').classList.add('active');
            app.initPdf(); // Load PDF when view is active
        } else {
            document.getElementById(`view-${viewId}`).classList.add('active');
        }

        window.scrollTo(0, 0);
    },

    goHome: () => {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById('view-home').classList.add('active');
    },

    /* Materi Logic */
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
        const list = app.data.materi.filter(m => m.jilid == jilid).sort((a, b) => a.urutan - b.urutan);
        const container = document.getElementById('materi-list-container');
        container.innerHTML = '';

        document.getElementById('view-jilid-select').classList.remove('active');
        document.getElementById('view-materi-list').classList.add('active');
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
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            Array.from(container.children).forEach(el => {
                const text = el.textContent.toLowerCase();
                el.style.display = text.includes(term) ? 'block' : 'none';
            });
        };
    },

    openMateriDetail: (item) => {
        document.getElementById('view-materi-list').classList.remove('active');
        document.getElementById('view-materi-detail').classList.add('active');
        document.getElementById('materi-detail-title').textContent = item.judul;

        // Simple Markdown Parser (Bold, Italic, Arabic Div)
        let content = item.konten_md || '';

        // Parse custom arabic tags if needed or just use HTML in sheet
        // Convert \n to <br>
        content = content.replace(/\n/g, '<br>');
        // Bold
        content = content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');

        document.getElementById('materi-content').innerHTML = content;
    },

    backToMateriList: () => {
        document.getElementById('view-materi-detail').classList.remove('active');
        document.getElementById('view-materi-list').classList.add('active');
    },

    /* Quiz Logic */
    startQuiz: (jilid) => {
        const questions = app.data.quiz.filter(q => q.jilid == jilid);
        if (questions.length === 0) {
            alert('Soal belum tersedia untuk jilid ini.');
            return;
        }

        app.state.currentQuiz = questions;
        app.state.quizAnswers = {};
        app.state.quizIndex = 0;

        document.getElementById('view-jilid-select').classList.remove('active');
        document.getElementById('view-quiz-runner').classList.add('active');

        app.renderQuestion();
    },

    renderQuestion: () => {
        const idx = app.state.quizIndex;
        const q = app.state.currentQuiz[idx];
        const total = app.state.currentQuiz.length;

        document.getElementById('quiz-counter').textContent = `${idx + 1} / ${total}`;
        document.getElementById('quiz-question-text').innerHTML = q.pertanyaan; // Allow HTML in questions

        const container = document.getElementById('quiz-options-container');
        container.innerHTML = '';

        ['A', 'B', 'C', 'D'].forEach(opt => {
            const val = q[`opsi_${opt.toLowerCase()}`];
            if (!val) return; // Skip empty options

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

        // Save answer
        app.state.quizAnswers[q.question_id] = {
            user: answer,
            correct: q.jawaban_benar,
            isCorrect: answer === q.jawaban_benar
        };

        // Next or Finish
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

        document.getElementById('view-quiz-runner').classList.remove('active');
        document.getElementById('view-quiz-review').classList.remove('active');
        document.getElementById('view-quiz-result').classList.add('active');

        // Setup review button handled in HTML
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

        document.getElementById('view-quiz-result').classList.remove('active');
        document.getElementById('view-quiz-review').classList.add('active');
    },

    /* PDF Viewer Logic */
    initPdf: () => {
        // Set worker (important for performance)
        // If offline, this should point to local file 'js/pdf.worker.min.js'
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

        const canvas = document.getElementById('the-canvas');
        app.state.pdfState.canvas = canvas;
        app.state.pdfState.ctx = canvas.getContext('2d');

        // Reset state
        app.state.pdfState.pageNum = 1;
        app.state.pdfState.scale = 1.0;

        // Load PDF
        const url = 'assets/hafalan.pdf';

        // Show Loading (Optional: Add spinner)

        pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
            app.state.pdfState.pdfDoc = pdfDoc_;
            document.getElementById('page-count').textContent = pdfDoc_.numPages;

            // Render first page
            app.renderPdfPage(app.state.pdfState.pageNum);
        }).catch(err => {
            console.error('Error loading PDF: ' + err);
            alert('Gagal memuat file Hafalan (hafalan.pdf tidak ditemukan).');
        });

        // Setup Controls
        document.getElementById('prev-page').onclick = app.onPrevPage;
        document.getElementById('next-page').onclick = app.onNextPage;
        document.getElementById('zoom-in').onclick = app.onZoomIn;
        document.getElementById('zoom-out').onclick = app.onZoomOut;
    },

    renderPdfPage: (num) => {
        app.state.pdfState.pageRendering = true;

        // Fetch page
        app.state.pdfState.pdfDoc.getPage(num).then(page => {
            const viewport = page.getViewport({ scale: app.state.pdfState.scale });
            const canvas = app.state.pdfState.canvas;

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Render context
            const renderContext = {
                canvasContext: app.state.pdfState.ctx,
                viewport: viewport
            };

            const renderTask = page.render(renderContext);

            // Wait for render to finish
            renderTask.promise.then(() => {
                app.state.pdfState.pageRendering = false;

                if (app.state.pdfState.pageNumPending !== null) {
                    // New page rendering is pending
                    app.renderPdfPage(app.state.pdfState.pageNumPending);
                    app.state.pdfState.pageNumPending = null;
                }
            });
        });

        // Update page counters
        document.getElementById('page-num').textContent = num;
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
        app.state.pdfState.scale += 0.2;
        app.renderPdfPage(app.state.pdfState.pageNum);
    },

    onZoomOut: () => {
        if (app.state.pdfState.scale <= 0.6) return;
        app.state.pdfState.scale -= 0.2;
        app.renderPdfPage(app.state.pdfState.pageNum);
    }
};


// Start
document.addEventListener('DOMContentLoaded', app.init);
