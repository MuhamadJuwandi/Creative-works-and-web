// app.js - Main Application Logic

const app = {
    state: {
        currentView: 'dashboard',
        currentExam: null,     // The Exam Object
        currentSession: null,  // The Session Object
        pdfDoc: null,          // Charged PDF Document
        scale: 1.5,            // PDF Zoom Scale
        currentPage: 1,        // Current Question/Page
        totalPages: 0,         // Total pages in the current PDF
        timerInterval: null,
        isDrawerOpen: false,   // UI State for mobile drawer
    },

    async init() {
        console.log('App Initializing...');
        // DB is defined in db.js which is loaded synchronously.
        this.bindEvents();
        this.navigateTo('dashboard');
    },

    bindEvents() {
        // Create Exam Form
        document.getElementById('create-exam-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateExamSave();
        });

        // Answer Key Parsing feedback
        document.getElementById('exam-key').addEventListener('input', (e) => {
            this.parseKeyPreview(e.target.value);
        });

        // PDF Navigation Preview
        document.getElementById('exam-pdf').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) document.getElementById('file-upload-preview').innerHTML = `<p class="font-bold text-green-600">${file.name}</p>`;
        });

        // Exam Controls
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleAnswer(e.target.dataset.val));
        });

        document.getElementById('btn-prev-page').addEventListener('click', () => this.changePage(-1));
        document.getElementById('btn-next-page').addEventListener('click', () => this.changePage(1));

        document.getElementById('btn-zoom-in').addEventListener('click', () => this.changeZoom(0.2));
        document.getElementById('btn-zoom-out').addEventListener('click', () => this.changeZoom(-0.2));

        // Mobile Drawer Controls
        document.getElementById('btn-toggle-drawer').addEventListener('click', () => this.toggleDrawer(true));
        document.getElementById('drawer-overlay').addEventListener('click', () => this.toggleDrawer(false));
        document.getElementById('btn-close-drawer').addEventListener('click', () => this.toggleDrawer(false));
    },

    async navigateTo(viewId, params = {}) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));

        // Show target view
        document.getElementById(`view-${viewId}`).classList.remove('hidden');
        this.state.currentView = viewId;

        // View specific logic
        if (viewId === 'dashboard') {
            this.renderDashboard();
        } else if (viewId === 'create') {
            this.resetCreateForm();
        } else if (viewId === 'result') {
            this.renderResult(params.sessionId);
        }
    },

    // --- DASHBOARD ---
    async renderDashboard() {
        const listContainer = document.getElementById('exam-list-container');
        try {
            listContainer.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-12 text-gray-400">
                    <i data-lucide="loader-2" class="w-8 h-8 animate-spin"></i>
                    <span class="mt-2">Memuat data...</span>
                </div>
            `;
            lucide.createIcons();

            const exams = await DB.getAllExams();

            if (exams.length === 0) {
                listContainer.innerHTML = `
                    <div class="col-span-full text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                        <p class="text-gray-500 mb-4">Belum ada ujian.</p>
                        <button onclick="app.navigateTo('create')" class="text-ut-orange font-bold hover:underline">Buat Ujian Baru</button>
                    </div>
                `;
                return;
            }

            listContainer.innerHTML = exams.map(exam => `
                <div class="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition border border-gray-100 flex flex-col">
                    <div class="h-2 bg-blue-800"></div>
                    <div class="p-6 flex-1">
                        <div class="text-xs font-bold text-gray-400 mb-1">${exam.code || 'NO-CODE'}</div>
                        <h3 class="font-bold text-lg text-gray-800 mb-2 leading-tight">${exam.title}</h3>
                        <div class="text-sm text-gray-500 mb-4">${exam.questionCount} Soal • Dibuat ${new Date(exam.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="bg-gray-50 p-4 border-t border-gray-100 flex justify-between items-center">
                        <button onclick="app.deleteExam('${exam.id}')" class="text-red-500 hover:text-red-700 text-sm">Hapus</button>
                        <button onclick="app.startExam('${exam.id}')" class="bg-blue-800 hover:bg-blue-900 text-white px-4 py-2 rounded text-sm font-bold flex items-center gap-2">
                            Mulai Ujian <i data-lucide="play" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            `).join('');
            lucide.createIcons();

        } catch (err) {
            console.error('Dashboard Error:', err);
            listContainer.innerHTML = `
                <div class="col-span-full bg-red-50 border border-red-200 text-red-700 p-4 rounded text-center">
                    <p class="font-bold">Gagal memuat data.</p>
                    <p class="text-sm">${err.message}</p>
                    <button onclick="location.reload()" class="mt-2 text-blue-600 underline text-sm">Muat Ulang</button>
                </div>
            `;
        }
    },

    async deleteExam(id) {
        if (confirm('Hapus ujian ini? Data siswa terkait tidak ikut terhapus otomatis.')) {
            await DB.deleteExam(id);
            this.renderDashboard();
        }
    },

    // --- CREATE EXAM ---
    resetCreateForm() {
        document.getElementById('create-exam-form').reset();
        document.getElementById('file-upload-preview').innerHTML = `
            <i data-lucide="upload-cloud" class="w-10 h-10 text-gray-400 mx-auto mb-2"></i>
            <p class="text-sm text-gray-500">Klik atau tarik file PDF ke sini</p>
        `;
        lucide.createIcons();
    },

    parseKeyPreview(text) {
        // Attempt to parse "1. A\n2. B" OR "ABCD..."
        let keys = {};
        const cleanText = text.replace(/\s+/g, ' ').trim();
        let count = 0;

        // Strategy 1: Check if content is mostly just letters "ABCD..."
        const lettersOnly = cleanText.replace(/[^a-dA-D]/g, '');

        if (lettersOnly.length > 5 && !cleanText.includes('1.')) {
            // Assume raw string string
            for (let i = 0; i < lettersOnly.length; i++) {
                keys[i + 1] = lettersOnly[i].toUpperCase();
                count++;
            }
        } else {
            // Strategy 2: Numbered List "1. A"
            // Simple regex for "1. A" or "1 A" or "1A"
            const matches = text.matchAll(/(\d+)[\.\s]*([a-dA-D])/g);
            for (const m of matches) {
                keys[m[1]] = m[2].toUpperCase();
                count++;
            }
        }

        const statusDiv = document.getElementById('key-parsing-status');
        if (count > 0) {
            statusDiv.innerHTML = `<span class="text-green-600 font-bold">Terdeteksi ${count} jawaban.</span>`;
        } else {
            statusDiv.innerHTML = 'Menunggu input...';
        }
        return { keys, count };
    },

    async handleCreateExamSave() {
        const title = document.getElementById('exam-title').value;
        const code = document.getElementById('exam-code').value;
        const fileInput = document.getElementById('exam-pdf');
        const keyInput = document.getElementById('exam-key').value;

        if (!fileInput.files[0]) return alert('Pilih file PDF!');

        const { keys, count } = this.parseKeyPreview(keyInput);
        if (count === 0) return alert('Kunci jawaban tidak valid!');

        const pdfFile = fileInput.files[0];

        // Count pages to verify question count assumption (1 page = 1 question)
        try {
            const arrayBuffer = await pdfFile.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

            if (pdf.numPages !== count) {
                if (!confirm(`Jumlah halaman PDF (${pdf.numPages}) tidak sama dengan jumlah kunci jawaban (${count}). Lanjutkan?`)) {
                    return;
                }
            }

            const exam = {
                id: crypto.randomUUID(),
                title,
                code,
                pdfBlob: new Blob([pdfFile], { type: 'application/pdf' }),
                answerKey: keys,
                questionCount: Math.max(pdf.numPages, count), // Use max strategy
                createdAt: Date.now()
            };

            await DB.saveExam(exam);
            alert('Ujian berhasil dibuat!');
            this.navigateTo('dashboard');

        } catch (err) {
            console.error(err);
            alert('Gagal membaca PDF: ' + err.message);
        }
    },

    // --- EXAM RUNNER ---
    async startExam(examId) {
        // Load Exam
        const exam = await DB.getExam(examId);
        if (!exam) return alert('Exam not found!');

        this.state.currentExam = exam;

        // Initialize Session (or reuse logic if we wanted resume, simplified here: new session)
        // For persistence "close and open again", we should check if there is an active session
        // Simplified: We'll create a new session ID based on Time or something fixed if we want per-exam single attempt.
        // Let's make a unique ID per attempt.

        // Wait! Requirement: "ketika diclose dan nanti akan saya buka lagi data data sebelumnya masih ada"
        // This implies resuming. Let's look for an incomplete session for this exam.
        const allSessions = await DB.getAllSessions();
        let session = allSessions.find(s => s.examId === examId && !s.isComplete);

        if (!session) {
            session = {
                id: crypto.randomUUID(),
                examId: examId,
                studentInfo: { name: 'Mahasiswa', nim: '052550559' },
                answers: {},
                startTime: Date.now(),
                timeLeft: 10800, // 3 hours default
                isComplete: false
            };
            await DB.saveSession(session);
        }

        this.state.currentSession = session;
        this.state.currentPage = 1;

        // Update DOM
        document.getElementById('sim-nim').innerText = session.studentInfo.nim;
        document.getElementById('sim-code').innerText = exam.code;
        document.getElementById('sim-title').innerText = exam.title;

        // Mobile DOM Updates
        if (document.getElementById('sim-code-mobile')) {
            document.getElementById('sim-code-mobile').innerText = exam.code + " - " + exam.title;
        }

        // Load PDF
        await this.loadPDF(exam.pdfBlob);

        // Render
        this.navigateTo('exam');
        app.renderQuestionList();
        app.renderCurrentPage();

        // Resize Listener for Responsive PDF
        window.addEventListener('resize', app.handleResize);

        // Start Timer
        app.startTimer();
    },

    async loadPDF(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        this.state.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        this.state.totalPages = this.state.pdfDoc.numPages;
    },

    handleResize: () => {
        // Debounce or just re-render current page
        if (app.resizeTimeout) clearTimeout(app.resizeTimeout);
        app.resizeTimeout = setTimeout(() => {
            app.renderCurrentPage();
        }, 200);
    },

    toggleDrawer: (show) => {
        app.state.isDrawerOpen = show;
        const drawer = document.getElementById('question-drawer');
        const overlay = document.getElementById('drawer-overlay');

        if (show) {
            drawer.classList.remove('-translate-x-full');
            overlay.classList.remove('hidden');
        } else {
            drawer.classList.add('-translate-x-full');
            overlay.classList.add('hidden');
        }
    },

    startTimer() {
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);

        const updateTimer = async () => {
            const s = this.state.currentSession;
            if (s.timeLeft <= 0) {
                this.finishExam();
                return;
            }
            s.timeLeft--;

            // Format time
            const h = Math.floor(s.timeLeft / 3600).toString().padStart(2, '0');
            const m = Math.floor((s.timeLeft % 3600) / 60).toString().padStart(2, '0');
            const sec = (s.timeLeft % 60).toString().padStart(2, '0');
            const timeString = `${h}:${m}:${sec}`;

            document.getElementById('sim-timer').textContent = timeString;

            // Update Mobile Timer
            if (document.getElementById('sim-timer-mobile')) {
                document.getElementById('sim-timer-mobile').textContent = timeString;
            }

            // Save every 5 seconds
            if (s.timeLeft % 5 === 0) {
                await DB.saveSession(s);
            }
        };

        updateTimer(); // Initial call
        this.state.timerInterval = setInterval(updateTimer, 1000);
    },

    renderQuestionList() {
        const container = document.getElementById('question-list-container');
        const count = this.state.currentExam.questionCount;
        let html = '';

        for (let i = 1; i <= count; i++) {
            const ans = this.state.currentSession.answers[i];
            const isActive = i === this.state.currentPage;
            const bgClass = isActive ? 'bg-yellow-200' : (ans ? 'bg-black text-white' : 'bg-transparent text-black');
            const borderClass = isActive ? 'border-yellow-600' : 'border-b border-gray-300';

            html += `
                <div onclick="app.jumpToPage(${i})" 
                     class="cursor-pointer flex items-center h-8 text-xs ${bgClass} ${borderClass} hover:bg-gray-200 transition">
                    <div class="w-8 text-center border-r border-gray-300 py-2">${i}.</div>
                    <div class="flex-1 text-center font-bold text-red-600">${ans || ''}</div>
                </div>
            `;
        }
        container.innerHTML = html;

        // Auto scroll to current
        // (Optional enhancement)
    },

    async renderCurrentPage() {
        if (!this.state.pdfDoc) return;

        const pageNum = this.state.currentPage;

        // 1. Render PDF Canvas
        try {
            const page = await this.state.pdfDoc.getPage(pageNum);
            const canvas = document.getElementById('pdf-render');
            const context = canvas.getContext('2d');

            // Responsive Scale Calculation
            const containerWidth = document.getElementById('pdf-wrapper').clientWidth;
            // Subtract padding (32px)
            const targetWidth = containerWidth - 32;

            const viewport = page.getViewport({ scale: 1.0 });
            const scale = targetWidth / viewport.width;

            const scaledViewport = page.getViewport({ scale: scale });

            canvas.height = scaledViewport.height;
            canvas.width = scaledViewport.width;

            const renderContext = {
                canvasContext: context,
                viewport: scaledViewport
            };
            await page.render(renderContext).promise;

        } catch (e) {
            console.error('Page render error', e);
        }

        // 2. Update Answers UI for this page
        const currentAns = this.state.currentSession.answers[pageNum];
        document.querySelectorAll('.answer-btn').forEach(btn => {
            const val = btn.dataset.val;
            if (val === currentAns) {
                btn.classList.add('bg-black', 'text-white', 'border-black');
                btn.classList.remove('text-gray-700', 'border-gray-300');
            } else {
                btn.classList.remove('bg-black', 'text-white', 'border-black');
                btn.classList.add('text-gray-700', 'border-gray-300');
            }
        });

        // 3. Update Sidebar Highlight
        this.renderQuestionList();

        // 4. Update Header Page Display (if existing in UI)
    },

    jumpToPage(num) {
        this.state.currentPage = num;
        this.renderCurrentPage();

        // Auto-close drawer on mobile
        if (window.innerWidth < 768) {
            this.toggleDrawer(false);
        }
    },

    changePage(delta) {
        const newPage = this.state.currentPage + delta;
        if (newPage >= 1 && newPage <= this.state.currentExam.questionCount) {
            this.state.currentPage = newPage;
            this.renderCurrentPage();
        }
    },

    changeZoom(delta) {
        this.state.scale = Math.max(0.5, this.state.scale + delta);
        this.renderCurrentPage();
    },

    async handleAnswer(val) {
        if (!this.state.currentSession) return;

        // Save Answer
        this.state.currentSession.answers[this.state.currentPage] = val;

        // Update DB
        await DB.saveSession(this.state.currentSession);

        // Update UI
        this.renderCurrentPage();

        // Auto-next? (Optional: The screenshots don't imply auto-next, but it's common)
        // Let's stay on page to allow review.
    },

    async finishExam() {
        if (!confirm('Apakah anda yakin ingin mengakhiri ujian?')) return;

        clearInterval(this.state.timerInterval);
        this.state.currentSession.isComplete = true;
        this.state.currentSession.score = this.calculateScore();
        await DB.saveSession(this.state.currentSession);

        this.navigateTo('result', { sessionId: this.state.currentSession.id });
    },

    calculateScore() {
        let correct = 0;
        const answers = this.state.currentSession.answers;
        const key = this.state.currentExam.answerKey;

        for (const [qNum, ans] of Object.entries(answers)) {
            if (key[qNum] === ans) correct++;
        }
        return correct;
    },

    // --- RESULTS ---
    async renderResult(sessionId) {
        const session = await DB.getSession(sessionId);
        const exam = await DB.getExam(session.examId);

        document.getElementById('res-score').textContent = session.score;
        document.getElementById('res-total').textContent = exam.questionCount;

        // Generate Review List
        const reviewList = document.getElementById('review-list');
        const key = exam.answerKey;
        const answers = session.answers;
        let html = '';

        for (let i = 1; i <= exam.questionCount; i++) {
            const userAns = answers[i];
            const correctAns = key[i];
            const isCorrect = userAns === correctAns;
            const isAnswered = !!userAns;

            let statusClass = isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
            if (!isAnswered) statusClass = 'bg-orange-50 border-orange-200';

            let icon = isCorrect
                ? '<i data-lucide="check-circle" class="w-5 h-5 text-green-600"></i>'
                : '<i data-lucide="x-circle" class="w-5 h-5 text-red-600"></i>';

            html += `
                <div class="border rounded-xl p-4 ${statusClass} flex flex-col gap-2 shadow-sm">
                    <div class="flex justify-between items-start">
                        <span class="font-bold text-gray-800 text-lg">Soal ${i}</span>
                        ${icon}
                    </div>
                    
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-gray-500 w-24">Jawaban Anda:</span>
                        <span class="font-bold px-2 py-0.5 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                            ${userAns || 'Tidak Dijawab'}
                        </span>
                    </div>

                    ${!isCorrect ? `
                    <div class="flex items-center gap-2 text-sm">
                        <span class="text-gray-500 w-24">Kunci Benar:</span>
                        <span class="font-bold px-2 py-0.5 rounded bg-green-100 text-green-800">
                            ${correctAns || 'N/A'}
                        </span>
                    </div>
                    ` : ''}
                </div>
            `;
        }
        reviewList.innerHTML = html;
        lucide.createIcons();
    },

    toggleReview() {
        const el = document.getElementById('review-container');
        el.classList.toggle('hidden');
        if (!el.classList.contains('hidden')) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

// Start
window.addEventListener('load', () => app.init());
