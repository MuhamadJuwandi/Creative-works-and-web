// app.js - Main Application Logic for UT Mobile Exam Simulator

const app = {
    state: {
        currentView: 'dashboard',
        currentExam: null,
        currentSession: null,
        pdfDoc: null,
        currentPage: 1,
        zoomLevel: 1.0,
        timerInterval: null,
        pdfHidden: false,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        scrollStartX: 0,
        scrollStartY: 0,
        // Review Mode
        isReviewMode: false,
        reviewQueue: [],
        resultContext: null
    },

    // ==========================================
    // INITIALIZATION
    // ==========================================
    async init() {
        console.log('[UT Mobile] App Initializing...');
        this.bindEvents();
        this.initPanZoom();
        this.navigateTo('dashboard');
    },

    initPanZoom() {
        const container = document.getElementById('exam-content-area');
        const pdfWrapper = document.getElementById('pdf-container');
        
        pdfWrapper.style.cursor = 'grab';

        const startDrag = (e) => {
            this.state.isDragging = true;
            pdfWrapper.style.cursor = 'grabbing';
            this.state.dragStartX = e.clientX;
            this.state.dragStartY = e.clientY;
            this.state.scrollStartX = container.scrollLeft;
            this.state.scrollStartY = container.scrollTop;
        };

        const onDrag = (e) => {
            if (!this.state.isDragging) return;
            e.preventDefault();
            
            const dx = e.clientX - this.state.dragStartX;
            const dy = e.clientY - this.state.dragStartY;
            
            container.scrollLeft = this.state.scrollStartX - dx;
            container.scrollTop = this.state.scrollStartY - dy;
        };

        const stopDrag = () => {
            this.state.isDragging = false;
            pdfWrapper.style.cursor = 'grab';
        };

        // Mouse events for desktop dragging
        pdfWrapper.addEventListener('mousedown', startDrag);
        window.addEventListener('mousemove', onDrag, { passive: false });
        window.addEventListener('mouseup', stopDrag);
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

        // PDF file change preview
        document.getElementById('exam-pdf').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById('file-upload-preview').innerHTML =
                    `<span class="upload-icon">✅</span><p class="upload-success">${file.name}</p><p class="upload-hint">${(file.size / 1024 / 1024).toFixed(2)} MB</p>`;
            }
        });
    },

    // ==========================================
    // NAVIGATION
    // ==========================================
    async navigateTo(viewId, params = {}) {
        // Hide all views
        document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

        // Show target view
        document.getElementById(`view-${viewId}`).classList.add('active');
        this.state.currentView = viewId;

        // View-specific logic
        if (viewId === 'dashboard') {
            this.renderDashboard();
        } else if (viewId === 'create') {
            this.resetCreateForm();
        } else if (viewId === 'result') {
            this.renderResult(params.sessionId);
        }
    },

    // ==========================================
    // DASHBOARD
    // ==========================================
    async renderDashboard() {
        const listContainer = document.getElementById('exam-list-container');
        listContainer.innerHTML = '<div class="loading-spinner"><div class="spinner"></div><span>Memuat data...</span></div>';

        const exams = await DB.getAllExams();
        document.getElementById('exam-count-badge').textContent = exams.length;

        if (exams.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M9 12h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    <p>Belum ada ujian tersedia</p>
                    <p class="hint">Ketuk tombol + untuk menambah ujian baru</p>
                </div>
            `;
            return;
        }

        // Sort by newest first
        exams.sort((a, b) => b.createdAt - a.createdAt);

        listContainer.innerHTML = exams.map(exam => `
            <div class="exam-card">
                <div class="exam-card-accent"></div>
                <div class="exam-card-body">
                    <div class="exam-card-code">${exam.code || 'NO-CODE'}</div>
                    <div class="exam-card-title">${exam.title}</div>
                    <div class="exam-card-meta">
                        <span>📝 ${exam.questionCount} Soal</span>
                        <span>📅 ${new Date(exam.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                </div>
                <div class="exam-card-footer">
                    <button class="btn-delete-exam" onclick="app.deleteExam('${exam.id}')">🗑 Hapus</button>
                    <button class="btn-start-exam" onclick="app.startExam('${exam.id}')">
                        Mulai Ujian ▶
                    </button>
                </div>
            </div>
        `).join('');
    },

    async deleteExam(id) {
        if (confirm('Hapus ujian ini beserta semua sesi terkait?')) {
            await DB.deleteExam(id);
            await DB.deleteSessionsByExam(id);
            this.renderDashboard();
        }
    },

    // ==========================================
    // CREATE EXAM
    // ==========================================
    resetCreateForm() {
        document.getElementById('create-exam-form').reset();
        document.getElementById('file-upload-preview').innerHTML = `
            <span class="upload-icon">📄</span>
            <p class="upload-text">Ketuk untuk memilih file PDF</p>
            <p class="upload-hint">atau tarik file ke sini</p>
        `;
        document.getElementById('key-parsing-status').textContent = 'Menunggu input...';
        document.getElementById('key-parsing-status').className = 'key-status';
    },

    parseKeyPreview(text) {
        let keys = {};
        const cleanText = text.replace(/\s+/g, ' ').trim();
        let count = 0;

        // Strategy 1: Just letters "ABCD..."
        const lettersOnly = cleanText.replace(/[^a-eA-E]/g, '');

        if (lettersOnly.length > 5 && !cleanText.includes('1.')) {
            for (let i = 0; i < lettersOnly.length; i++) {
                keys[i + 1] = lettersOnly[i].toUpperCase();
                count++;
            }
        } else {
            // Strategy 2: Numbered "1. A" or "1.A" or "1 A"
            const matches = text.matchAll(/(\d+)[.\s]*([a-eA-E])/g);
            for (const m of matches) {
                keys[m[1]] = m[2].toUpperCase();
                count++;
            }
        }

        const statusDiv = document.getElementById('key-parsing-status');
        if (count > 0) {
            statusDiv.innerHTML = `✅ Terdeteksi <strong>${count}</strong> jawaban`;
            statusDiv.className = 'key-status detected';
        } else {
            statusDiv.textContent = 'Menunggu input...';
            statusDiv.className = 'key-status';
        }
        return { keys, count };
    },

    async handleCreateExamSave() {
        const title = document.getElementById('exam-title').value.trim();
        const code = document.getElementById('exam-code').value.trim();
        const fileInput = document.getElementById('exam-pdf');
        const keyInput = document.getElementById('exam-key').value;

        if (!fileInput.files[0]) return alert('Pilih file PDF!');

        const { keys, count } = this.parseKeyPreview(keyInput);
        if (count === 0) return alert('Kunci jawaban tidak valid!');

        const pdfFile = fileInput.files[0];

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
                questionCount: Math.max(pdf.numPages, count),
                createdAt: Date.now()
            };

            await DB.saveExam(exam);
            alert('✅ Ujian berhasil disimpan!');
            this.navigateTo('dashboard');

        } catch (err) {
            console.error(err);
            alert('Gagal membaca PDF: ' + err.message);
        }
    },

    // ==========================================
    // EXAM RUNNER
    // ==========================================
    async startExam(examId) {
        this.state.isReviewMode = false;
        this.state.pdfHidden = false;

        const exam = await DB.getExam(examId);
        if (!exam) return alert('Ujian tidak ditemukan!');

        this.state.currentExam = exam;

        // Check for existing incomplete session (resume capability)
        const allSessions = await DB.getAllSessions();
        let session = allSessions.find(s => s.examId === examId && !s.isComplete);

        if (!session) {
            session = {
                id: crypto.randomUUID(),
                examId: examId,
                studentInfo: { name: 'MUHAMAD JUWANDI', nim: '052550559' },
                answers: {},
                startTime: Date.now(),
                timeLeft: 7200, // 2 hours
                isComplete: false
            };
            await DB.saveSession(session);
        }

        this.state.currentSession = session;
        this.state.currentPage = 1;

        // Update UI
        document.getElementById('sim-code').textContent = exam.code;
        document.getElementById('sim-title').textContent = exam.title;
        document.getElementById('sim-total-num').textContent = exam.questionCount;
        document.getElementById('sim-student-name').textContent = session.studentInfo.name;
        document.getElementById('sim-student-detail').textContent =
            `NIM ${session.studentInfo.nim} • Jenis Kelamin: Laki-laki`;

        // Reset finish button
        const finishBtn = document.getElementById('btn-finish-exam');
        finishBtn.innerHTML = '✓ Selesai Ujian';
        finishBtn.onclick = () => app.showFinishModal();

        // Reset timer display visibility
        const timerRow = document.querySelector('.exam-info-row2');
        if (timerRow) timerRow.style.display = '';

        // Load PDF
        await this.loadPDF(exam.pdfBlob);

        // Navigate & render
        this.navigateTo('exam');
        this.renderQuestionNav();
        this.renderCurrentPage();
        this.updateAnsweredCount();
        this.startTimer();
    },

    async loadPDF(blob) {
        const arrayBuffer = await blob.arrayBuffer();
        this.state.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    },

    startTimer() {
        if (this.state.timerInterval) clearInterval(this.state.timerInterval);

        const updateTimer = async () => {
            const s = this.state.currentSession;
            if (!s || s.isComplete) {
                clearInterval(this.state.timerInterval);
                return;
            }

            if (s.timeLeft <= 0) {
                this.confirmFinish();
                return;
            }
            s.timeLeft--;

            const h = Math.floor(s.timeLeft / 3600).toString().padStart(2, '0');
            const m = Math.floor((s.timeLeft % 3600) / 60).toString().padStart(2, '0');
            const sec = (s.timeLeft % 60).toString().padStart(2, '0');
            document.getElementById('sim-timer').textContent = `${h}:${m}:${sec}`;

            // Auto-save every 5 seconds
            if (s.timeLeft % 5 === 0) {
                await DB.saveSession(s);
            }
        };

        updateTimer();
        this.state.timerInterval = setInterval(updateTimer, 1000);
    },

    // ==========================================
    // QUESTION NAVIGATOR
    // ==========================================
    renderQuestionNav() {
        const container = document.getElementById('question-nav-scroll');
        const count = this.state.currentExam.questionCount;
        const list = this.state.isReviewMode ? this.state.reviewQueue : Array.from({ length: count }, (_, k) => k + 1);

        let html = '';
        list.forEach(i => {
            const ans = this.state.currentSession.answers[i];
            const isCurrent = i === this.state.currentPage;

            let cls = 'q-num';
            if (isCurrent) {
                cls += ' current';
            } else if (ans) {
                cls += ' answered';
            } else {
                cls += ' unanswered';
            }

            html += `<div class="${cls}" onclick="app.jumpToPage(${i})">${i}</div>`;
        });

        container.innerHTML = html;

        // Auto-scroll to current question
        const currentEl = container.querySelector('.current');
        if (currentEl) {
            currentEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    },

    updateAnsweredCount() {
        if (!this.state.currentSession || !this.state.currentExam) return;
        const answered = Object.keys(this.state.currentSession.answers).length;
        const total = this.state.currentExam.questionCount;
        document.getElementById('sim-answered-count').textContent = `${answered}/${total}`;
    },

    // ==========================================
    // PDF RENDERING
    // ==========================================
    async renderCurrentPage() {
        if (!this.state.pdfDoc) return;

        const pageNum = this.state.currentPage;

        // Update page info
        document.getElementById('sim-current-num').textContent = pageNum;
        document.getElementById('sim-page-indicator').textContent = `${pageNum}/${this.state.currentExam.questionCount}`;

        // Render PDF
        try {
            const page = await this.state.pdfDoc.getPage(pageNum);
            const canvas = document.getElementById('pdf-render');
            const context = canvas.getContext('2d');

            const scrollContainer = document.getElementById('exam-content-area');
            const containerWidth = scrollContainer.clientWidth || 360;

            const unscaledViewport = page.getViewport({ scale: 1 });
            const baseScale = containerWidth / unscaledViewport.width;
            const scale = baseScale * this.state.zoomLevel;
            const viewport = page.getViewport({ scale: scale });

            // High DPI (Quality x2 to prevent blurriness)
            const pixelRatio = (window.devicePixelRatio || 1) * 2;
            canvas.width = Math.floor(viewport.width * pixelRatio);
            canvas.height = Math.floor(viewport.height * pixelRatio);
            canvas.style.width = Math.floor(viewport.width) + 'px';
            canvas.style.height = Math.floor(viewport.height) + 'px';

            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

        } catch (e) {
            console.error('Page render error:', e);
        }

        // Update PDF visibility
        const pdfContainer = document.getElementById('pdf-container');
        if (this.state.pdfHidden) {
            pdfContainer.style.display = 'none';
        } else {
            pdfContainer.style.display = '';
        }

        // Update answer buttons
        this.updateAnswerButtons();

        // Update nav
        this.renderQuestionNav();

        // Scroll content to top
        document.getElementById('exam-content-area').scrollTop = 0;
    },

    updateAnswerButtons() {
        const pageNum = this.state.currentPage;
        const currentAns = this.state.currentSession.answers[pageNum];
        const correctAns = this.state.currentExam.answerKey[pageNum];
        const isReview = this.state.isReviewMode;

        document.querySelectorAll('.answer-btn').forEach(btn => {
            const val = btn.dataset.val;

            // Reset classes
            btn.className = 'answer-btn';

            if (isReview) {
                btn.disabled = true;
                if (val === correctAns) {
                    btn.classList.add('correct');
                } else if (val === currentAns) {
                    btn.classList.add('wrong');
                } else {
                    btn.classList.add('dimmed');
                }
            } else {
                btn.disabled = false;
                if (val === currentAns) {
                    btn.classList.add('selected');
                }
            }
        });
    },

    // ==========================================
    // INTERACTIONS
    // ==========================================
    jumpToPage(num) {
        this.state.currentPage = num;
        this.renderCurrentPage();
    },

    changePage(delta) {
        if (this.state.isReviewMode) {
            const currentIdx = this.state.reviewQueue.indexOf(this.state.currentPage);
            let newIndex = currentIdx + delta;
            if (newIndex < 0) newIndex = 0;
            if (newIndex >= this.state.reviewQueue.length) newIndex = this.state.reviewQueue.length - 1;
            this.state.currentPage = this.state.reviewQueue[newIndex];
        } else {
            const newPage = this.state.currentPage + delta;
            if (newPage >= 1 && newPage <= this.state.currentExam.questionCount) {
                this.state.currentPage = newPage;
            }
        }
        this.renderCurrentPage();
    },

    async handleAnswer(val) {
        if (this.state.isReviewMode) return;
        if (!this.state.currentSession) return;

        this.state.currentSession.answers[this.state.currentPage] = val;
        await DB.saveSession(this.state.currentSession);

        this.updateAnswerButtons();
        this.renderQuestionNav();
        this.updateAnsweredCount();
    },

    changeZoom(delta) {
        this.state.zoomLevel = Math.max(0.5, Math.min(3.0, this.state.zoomLevel + delta));
        this.renderCurrentPage();
    },

    toggleFullscreen() {
        const shell = document.getElementById('app-shell');
        if (!document.fullscreenElement) {
            if (shell.requestFullscreen) {
                shell.requestFullscreen();
            } else if (shell.webkitRequestFullscreen) { /* Safari */
                shell.webkitRequestFullscreen();
            } else if (shell.msRequestFullscreen) { /* IE11 */
                shell.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) { /* Safari */
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) { /* IE11 */
                document.msExitFullscreen();
            }
        }
    },

    togglePdfVisibility() {
        this.state.pdfHidden = !this.state.pdfHidden;
        const pdfContainer = document.getElementById('pdf-container');
        if (this.state.pdfHidden) {
            pdfContainer.style.display = 'none';
        } else {
            pdfContainer.style.display = '';
        }
    },

    togglePetunjuk() {
        const toggle = document.getElementById('petunjuk-toggle');
        const content = document.getElementById('petunjuk-content');
        toggle.classList.toggle('open');
        content.classList.toggle('open');
    },

    // ==========================================
    // FINISH EXAM
    // ==========================================
    showFinishModal() {
        const session = this.state.currentSession;
        const exam = this.state.currentExam;

        const answered = Object.keys(session.answers).length;
        const total = exam.questionCount;
        const pct = Math.round((answered / total) * 100);

        document.getElementById('modal-progress-label').textContent =
            `Jawaban terkirim: ${answered} / ${total} (${pct}%)`;
        document.getElementById('modal-progress-fill').style.width = `${pct}%`;

        const statusEl = document.getElementById('modal-status');
        if (answered === total) {
            statusEl.textContent = 'Semua soal sudah Anda jawab. Setelah menekan "Ya, Selesaikan", ujian akan diakhiri.';
            statusEl.className = 'modal-status complete';
        } else {
            statusEl.textContent = `Masih ada ${total - answered} soal yang belum dijawab.`;
            statusEl.className = 'modal-status incomplete';
        }

        document.getElementById('modal-finish').classList.add('active');
    },

    closeFinishModal() {
        document.getElementById('modal-finish').classList.remove('active');
    },

    async confirmFinish() {
        this.closeFinishModal();
        clearInterval(this.state.timerInterval);

        this.state.currentSession.isComplete = true;
        this.state.currentSession.score = this.calculateScore();
        this.state.currentSession.finishedAt = Date.now();
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

    // ==========================================
    // RESULTS
    // ==========================================
    async renderResult(sessionId) {
        const session = await DB.getSession(sessionId);
        const exam = await DB.getExam(session.examId);

        this.state.resultContext = { session, exam };

        // Fill result data
        document.getElementById('res-subject').textContent = exam.title;
        document.getElementById('res-name').textContent = session.studentInfo.name;
        document.getElementById('res-name2').textContent = session.studentInfo.name;
        document.getElementById('res-nim').textContent = session.studentInfo.nim;

        const now = new Date();
        document.getElementById('res-date').textContent =
            `${now.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })} / 1`;

        document.getElementById('res-score').textContent = session.score;
        document.getElementById('res-total').textContent = exam.questionCount;

        // Reset review container
        document.getElementById('review-container').classList.remove('active');

        // Launch confetti
        this.launchConfetti();
    },

    launchConfetti() {
        const container = document.getElementById('confetti-container');
        container.innerHTML = '';

        const colors = ['#4CAF50', '#FF9800', '#2196F3', '#E91E63', '#FFEB3B', '#9C27B0', '#00BCD4', '#FF5722'];
        const shapes = ['circle', 'square', 'triangle'];

        for (let i = 0; i < 80; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';

            const color = colors[Math.floor(Math.random() * colors.length)];
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 3;
            const duration = 3 + Math.random() * 4;
            const size = 6 + Math.random() * 8;

            piece.style.left = `${left}%`;
            piece.style.animationDuration = `${duration}s`;
            piece.style.animationDelay = `${delay}s`;
            piece.style.width = `${size}px`;
            piece.style.height = `${size}px`;

            if (shape === 'circle') {
                piece.style.borderRadius = '50%';
                piece.style.background = color;
            } else if (shape === 'square') {
                piece.style.background = color;
                piece.style.borderRadius = '2px';
            } else {
                piece.style.width = '0';
                piece.style.height = '0';
                piece.style.borderLeft = `${size / 2}px solid transparent`;
                piece.style.borderRight = `${size / 2}px solid transparent`;
                piece.style.borderBottom = `${size}px solid ${color}`;
                piece.style.background = 'none';
            }

            container.appendChild(piece);
        }
    },

    toggleReviewDetail() {
        const container = document.getElementById('review-container');
        if (container.classList.contains('active')) {
            container.classList.remove('active');
        } else {
            const { session, exam } = this.state.resultContext;
            this.renderReviewList(session, exam, false);
            container.classList.add('active');
            setTimeout(() => {
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    },

    renderReviewList(session, exam, showWrongOnly) {
        const reviewList = document.getElementById('review-list');
        const key = exam.answerKey;
        const answers = session.answers;
        let html = '';

        for (let i = 1; i <= exam.questionCount; i++) {
            const userAns = answers[i];
            const correctAns = key[i];
            const isCorrect = userAns === correctAns;

            if (showWrongOnly && isCorrect) continue;

            const statusClass = isCorrect ? 'correct' : 'wrong';
            const icon = isCorrect ? '✅' : '❌';

            html += `
                <div class="review-item ${statusClass}">
                    <div class="review-item-header">
                        <span class="review-item-num">Soal ${i}</span>
                        <span class="review-item-icon">${icon}</span>
                    </div>
                    <div class="review-item-row">
                        <span class="label">Jawaban Anda:</span>
                        <span class="value ${isCorrect ? 'correct-val' : 'wrong-val'}">${userAns || 'Tidak Dijawab'}</span>
                    </div>
                    ${!isCorrect ? `
                    <div class="review-item-row">
                        <span class="label">Kunci Benar:</span>
                        <span class="value correct-val">${correctAns || 'N/A'}</span>
                    </div>
                    ` : ''}
                </div>
            `;
        }

        if (!html) {
            html = '<div style="text-align:center; padding:24px; color:#888;">Tidak ada soal yang sesuai filter.</div>';
        }

        reviewList.innerHTML = html;
    },

    // ==========================================
    // REVIEW WRONG ANSWERS (Back to Exam View)
    // ==========================================
    reviewWrongAnswers() {
        const { session, exam } = this.state.resultContext;

        // Find wrong answers
        const queue = [];
        for (let i = 1; i <= exam.questionCount; i++) {
            const userAns = session.answers[i];
            const correctAns = exam.answerKey[i];
            if (userAns !== correctAns) {
                queue.push(i);
            }
        }

        if (queue.length === 0) {
            alert('🎉 Selamat! Anda menjawab semua soal dengan benar.');
            return;
        }

        // Setup review mode
        this.state.isReviewMode = true;
        this.state.reviewQueue = queue;
        this.state.currentExam = exam;
        this.state.currentSession = session;
        this.state.currentPage = queue[0];

        // Change finish button to exit review
        const finishBtn = document.getElementById('btn-finish-exam');
        finishBtn.innerHTML = '← Keluar Review';
        finishBtn.onclick = () => app.navigateTo('result', { sessionId: session.id });

        // Hide timer in review mode
        const timerRow = document.querySelector('.exam-info-row2');
        if (timerRow) timerRow.style.display = 'none';

        // Load PDF and navigate
        this.loadPDF(exam.pdfBlob).then(() => {
            this.navigateTo('exam');
            this.renderQuestionNav();
            this.renderCurrentPage();
            this.updateAnsweredCount();
        });
    }
};

// Start the app
window.addEventListener('load', () => app.init());
