/**
 * Daily Card - JLPT Flashcard PWA Logic
 * Author: Antigravity
 */

const app = {
    // Config
    state: {
        currentLevel: null,
        currentMode: null, // 'kanji' or 'kotoba'
        courses: [], // Fetched data
        categories: [], // Chunked data
        currentCategoryData: [], // Current active category (50 items)
        currentPartId: null, // For tracking progress
        currentIndex: 0,
        isReviewMode: false,
        hardItems: [], // IDs of hard items
        progress: {} // { partId: count }
    },

    // Data Sources
    sources: {
        N5: {
            kanji: 'https://docs.google.com/spreadsheets/d/1QJ7q5wMKjuBu69sXpc_OgozoV8u1Nkd4XK5Jiz4NUfI/export?format=csv&gid=0',
            kotoba: 'https://docs.google.com/spreadsheets/d/1QJ7q5wMKjuBu69sXpc_OgozoV8u1Nkd4XK5Jiz4NUfI/export?format=csv&gid=1474825098'
        },
        N4: {
            kanji: 'https://docs.google.com/spreadsheets/d/1jX_-IBKIijwRljO97INBvDw7hPHefmh4ZoFb9SwLfYI/export?format=csv&gid=0',
            kotoba: 'https://docs.google.com/spreadsheets/d/1jX_-IBKIijwRljO97INBvDw7hPHefmh4ZoFb9SwLfYI/export?format=csv&gid=1203753908'
        },
        N3: {
            kanji: 'https://docs.google.com/spreadsheets/d/14TZzILBKsDhgZFBxdkeFObf4cK5WsimzeE3mT1pO5Fw/export?format=csv&gid=0',
            kotoba: 'https://docs.google.com/spreadsheets/d/14TZzILBKsDhgZFBxdkeFObf4cK5WsimzeE3mT1pO5Fw/export?format=csv&gid=1577608173'
        },
        N2: {
            kanji: 'https://docs.google.com/spreadsheets/d/13YEnDKPD9hplqCs7eKvFtjjZE8XKk7o7b03YH5D8jZk/export?format=csv&gid=0',
            kotoba: 'https://docs.google.com/spreadsheets/d/13YEnDKPD9hplqCs7eKvFtjjZE8XKk7o7b03YH5D8jZk/export?format=csv&gid=738690938'
        },
        N1: {
            kanji: 'https://docs.google.com/spreadsheets/d/1FKbWNv-mkN0cQU5qiHkAbS6JOnJmMDJXsner7iFmNQo/export?format=csv&gid=0',
            kotoba: 'https://docs.google.com/spreadsheets/d/1FKbWNv-mkN0cQU5qiHkAbS6JOnJmMDJXsner7iFmNQo/export?format=csv&gid=1573233696'
        }
    },

    // Themes
    themes: {
        N5: { primary: '#155B92' },
        N4: { primary: '#921515' },
        N3: { primary: '#159226' },
        N2: { primary: '#168092' },
        N1: { primary: '#C82B69' }
    },

    // Initialization
    init() {
        this.loadHardItems();
        this.loadProgress();

        // Handle Back Button
        document.getElementById('back-btn').addEventListener('click', () => {
            // If history stack is empty or we are deep, use history.back()
            // But for PWA simplicity, manual view management is safer unless we fully sync history
            if (window.history.state && window.history.state.view) {
                window.history.back();
            } else {
                this.navigateBack();
            }
        });

        // Handle Hardware Back Button
        window.onpopstate = (event) => {
            if (event.state && event.state.view) {
                this.restoreView(event.state.view);
            } else {
                // If popping state goes to null (initial), go home
                this.restoreView('home-view');
            }
        };

        // Initial history state
        if (!history.state) {
            window.history.replaceState({ view: 'home-view' }, '', '');
        }
    },

    // Navigation Logic
    restoreView(viewId) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        if (viewId === 'home-view') {
            document.getElementById('back-btn').classList.add('hidden');
            document.getElementById('page-title').innerText = 'Daily Card';
            document.documentElement.style.setProperty('--theme-primary', '#243A5E');
        } else {
            document.getElementById('back-btn').classList.remove('hidden');
        }
    },

    navigateBack() {
        // Fallback if history.back fails or for manual button
        const views = ['home-view', 'dashboard-view', 'parts-view', 'flashcard-view', 'about-view'];
        let activeId = views.find(id => document.getElementById(id).classList.contains('active'));

        if (activeId === 'flashcard-view') this.showView('parts-view');
        else if (activeId === 'parts-view') this.showView('dashboard-view');
        else if (activeId === 'dashboard-view') this.showView('home-view');
        else if (activeId === 'about-view') this.showView('home-view');
        else this.showView('home-view');
    },

    showView(viewId, pushHistory = true) {
        document.querySelectorAll('.view').forEach(el => el.classList.remove('active'));
        document.getElementById(viewId).classList.add('active');

        if (viewId === 'home-view') {
            document.getElementById('back-btn').classList.add('hidden');
            // Reset title when going home
            document.getElementById('page-title').innerText = 'Daily Card';
            document.documentElement.style.setProperty('--theme-primary', '#243A5E');
        } else {
            document.getElementById('back-btn').classList.remove('hidden');
        }

        if (pushHistory) {
            window.history.pushState({ view: viewId }, '', '');
        }
    },

    // Level Selection
    selectLevel(level) {
        this.state.currentLevel = level;
        this.applyTheme(level);
        document.getElementById('page-title').innerText = `${level} Dashboard`;
        this.showView('dashboard-view');

        // Update review count after selecting level
        setTimeout(() => this.updateReviewCount(), 100);
    },

    applyTheme(level) {
        const color = this.themes[level].primary;
        document.documentElement.style.setProperty('--theme-primary', color);
        document.querySelector('meta[name="theme-color"]').setAttribute('content', color);
    },

    // Mode Selection (Kanji/Kotoba)
    async selectMode(mode) {
        this.state.currentMode = mode;
        this.showLoading(true);

        try {
            const level = this.state.currentLevel;
            const url = this.getDataSourceUrl(level, mode);

            if (!url) throw new Error("Data source not found");

            const csvText = await this.fetchCSV(url);
            const data = this.parseCSV(csvText);

            this.state.courses = data;
            this.chunkData(data);
            this.renderPartsList();
            this.updateReviewCount();
            this.showView('parts-view');
        } catch (error) {
            console.error(error);
            alert("Gagal memuat data. Pastikan koneksi internet lancar.");
        } finally {
            this.showLoading(false);
        }
    },

    getDataSourceUrl(level, mode) {
        return this.sources[level][mode];
    },

    async fetchCSV(url) {
        const response = await fetch(url);
        return await response.text();
    },

    parseCSV(text) {
        // Robust CSV Parser
        const rows = [];
        let currentRow = [];
        let curStr = '';
        let inQuote = false;

        // Normalize line endings
        text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const nextChar = text[i + 1];

            if (inQuote) {
                if (char === '"' && nextChar === '"') {
                    curStr += '"';
                    i++;
                } else if (char === '"') {
                    inQuote = false;
                } else {
                    curStr += char;
                }
            } else {
                if (char === '"') {
                    inQuote = true;
                } else if (char === ',') {
                    currentRow.push(curStr);
                    curStr = '';
                } else if (char === '\n') {
                    currentRow.push(curStr);
                    curStr = '';
                    if (currentRow.length > 0) rows.push(currentRow);
                    currentRow = [];
                } else {
                    curStr += char;
                }
            }
        }
        if (curStr || currentRow.length > 0) {
            currentRow.push(curStr);
            rows.push(currentRow);
        }

        // Headers are first row, remove them
        if (rows.length < 2) return [];
        rows.shift();

        return rows.map((cols, index) => {
            if (this.state.currentMode === 'kanji') {
                // New Format: Kanji, Onyomi, Kunyomi, Arti Indo, Arti Inggris, Contoh
                // [0]Kanji, [1]Onyomi, [2]Kunyomi, [3]Arti Indo, [4]Arti Inggris, [5]Contoh

                // Format "Contoh" column
                let rawDetail = cols[5] || '';
                let formattedDetail = rawDetail;

                if (rawDetail) {
                    formattedDetail = rawDetail.split('\n').map(line => {
                        if (line.includes('=')) {
                            const parts = line.split('=').map(s => s.trim());
                            if (parts.length >= 3) {
                                return `<span class="example-line">
                                        <span class="ex-kanji">${parts[0]}</span> = 
                                        <span class="ex-kana">${parts[1]}</span> = 
                                        <span class="ex-mean">${parts[2]}</span>
                                    </span>`;
                            }
                        }
                        return line;
                    }).join('<br>');
                }

                return {
                    id: `${this.state.currentLevel}-K-${index}`,
                    front: cols[0],
                    reading: `${cols[1] || '-'} | ${cols[2] || '-'}`,
                    backMain: `${cols[3] || ''}\n(${cols[4] || ''})`,
                    detailHtml: formattedDetail,
                    type: 'kanji'
                };
            } else {
                // Format: Kanji, Kana, Arti
                // [0]Kanji, [1]Kana, [2]Arti
                return {
                    id: `${this.state.currentLevel}-W-${index}`,
                    front: cols[0] || cols[1], // Use Kana if Kanji empty
                    reading: cols[1],
                    backMain: cols[2],
                    detail: cols[0], // Kanji as detail
                    type: 'kotoba'
                };
            }
        }).filter(item => item && item.front);
    },

    chunkData(data) {
        const chunkSize = 50;
        this.state.categories = [];
        for (let i = 0; i < data.length; i += chunkSize) {
            this.state.categories.push(data.slice(i, i + chunkSize));
        }
    },

    renderPartsList() {
        const container = document.getElementById('parts-list');
        container.innerHTML = `<h3>${this.state.currentLevel} - ${this.state.currentMode === 'kanji' ? 'Kanji' : 'Kotoba'} List</h3>`;

        this.state.categories.forEach((chunk, index) => {
            const partId = `${this.state.currentLevel}-${this.state.currentMode}-${index}`;
            const progress = this.state.progress[partId] || 0;
            const total = chunk.length;
            const percent = Math.round((progress / total) * 100);

            const btn = document.createElement('div');
            btn.className = 'list-group-item';
            btn.innerHTML = `
                <div class="part-info">
                     <span>Bagian ${index + 1}</span>
                     <span class="part-count">${chunk.length} item</span>
                </div>
                <div class="part-progress">
                    <span class="progress-text">${percent}% Dikuasai</span>
                    <div class="mini-progress-bar"><div style="width:${percent}%"></div></div>
                </div>
            `;
            btn.onclick = () => this.startStudy(index);
            container.appendChild(btn);
        });
    },

    // Study Logic
    startStudy(partIndex) {
        this.state.currentCategoryData = this.state.categories[partIndex];
        this.state.currentPartId = `${this.state.currentLevel}-${this.state.currentMode}-${partIndex}`;
        this.state.currentIndex = 0;
        this.state.isReviewMode = false;
        this.showView('flashcard-view');
        this.renderCard();
    },

    startReviewSession() {
        // Filter logic: Find items in current loaded course that match Hard IDs
        if (!this.state.courses || this.state.courses.length === 0) {
            alert("Silakan masuk ke menu Kanji/Kotoba terlebih dahulu untuk memuat data.");
            return;
        }

        const hardItems = this.state.courses.filter(item => this.state.hardItems.includes(item.id));

        if (hardItems.length === 0) {
            alert("Tidak ada item sulit di mode ini.");
            return;
        }

        this.state.currentCategoryData = hardItems;
        this.state.currentIndex = 0;
        this.state.isReviewMode = true;
        this.showView('flashcard-view');
        this.renderCard();
    },

    updateReviewCount() {
        // Count hard items starting with current level prefix
        const prefix = `${this.state.currentLevel}-`;
        const count = this.state.hardItems.filter(id => id.startsWith(prefix)).length;
        document.getElementById('hard-count').innerText = count;
        if (count > 0) {
            document.getElementById('review-area').classList.remove('hidden');
        } else {
            document.getElementById('review-area').classList.add('hidden');
        }
    },

    // Flashcard Actions
    renderCard() {
        const item = this.state.currentCategoryData[this.state.currentIndex];
        const card = document.getElementById('current-card');

        // Ensure flip is reset
        card.classList.remove('flipped');

        // Add click listener dynamically or ensure unique
        card.onclick = () => this.flipCard();

        setTimeout(() => {
            // Front
            document.getElementById('card-front-text').innerText = item.front || '?';

            // Back - Labels for Kanji
            if (item.type === 'kanji') {
                const parts = item.reading.split('|');
                const onyomi = parts[0] ? parts[0].trim() : '-';
                const kunyomi = parts[1] ? parts[1].trim() : '-';

                document.getElementById('card-back-sub').innerHTML = `
                    <div class="reading-row">
                        <span class="reading-label">ONYOMI</span>
                        <span class="reading-val">${onyomi}</span>
                    </div>
                    <div class="reading-row">
                        <span class="reading-label">KUNYOMI</span>
                        <span class="reading-val">${kunyomi}</span>
                    </div>
                `;
            } else {
                // Kotoba
                document.getElementById('card-back-sub').innerText = item.reading || '';
            }

            document.getElementById('card-back-main').innerText = item.backMain || '...';

            if (item.detailHtml) {
                document.getElementById('card-back-detail').innerHTML = item.detailHtml;
            } else {
                document.getElementById('card-back-detail').innerText = item.detail || '';
            }

            // Button State
            const btnHard = document.querySelector('.btn-hard');
            if (this.state.hardItems.includes(item.id)) {
                btnHard.style.background = '#FFCDD2';
            } else {
                btnHard.style.background = '#FFEBEE';
            }
        }, 200);

        // Progress Bar
        const progress = ((this.state.currentIndex + 1) / this.state.currentCategoryData.length) * 100;
        document.getElementById('study-progress').style.width = `${progress}%`;
    },

    flipCard() {
        document.getElementById('current-card').classList.toggle('flipped');
    },

    markHard() {
        const item = this.state.currentCategoryData[this.state.currentIndex];
        if (!this.state.hardItems.includes(item.id)) {
            this.state.hardItems.push(item.id);
            this.saveHardItems();
            this.updateReviewCount();
        }
        // Hard doesn't increment "Mastered" progress
        this.nextCard();
    },

    markEasy() {
        const item = this.state.currentCategoryData[this.state.currentIndex];

        // If in review mode, removing it from hard list
        if (this.state.isReviewMode) {
            this.state.hardItems = this.state.hardItems.filter(id => id !== item.id);
            this.saveHardItems();
            this.updateReviewCount();

            // If empty, exit review
            if (this.state.currentCategoryData.length === 1) {
                alert("Review Selesai! Semua item sudah mudah.");
                this.navigateBack();
                return;
            }

            // Remove current item from view queue
            this.state.currentCategoryData.splice(this.state.currentIndex, 1);
            if (this.state.currentIndex >= this.state.currentCategoryData.length) {
                this.state.currentIndex = 0;
            }
            this.renderCard(); // Re-render current index (which is now next item)
            return;
        }

        // Normal Mode
        if (this.state.hardItems.includes(item.id)) {
            this.state.hardItems = this.state.hardItems.filter(id => id !== item.id);
            this.saveHardItems();
            this.updateReviewCount();
        } else {
            this.incrementProgress(this.state.currentPartId);
        }

        this.nextCard();
    },

    nextCard() {
        if (this.state.currentIndex < this.state.currentCategoryData.length - 1) {
            this.state.currentIndex++;
            this.renderCard();
        } else {
            alert("Selesai!");
            this.navigateBack();
        }
    },

    // Storage
    loadHardItems() {
        const stored = localStorage.getItem('dailyCard_hardItems');
        if (stored) {
            this.state.hardItems = JSON.parse(stored);
        }
    },

    saveHardItems() {
        localStorage.setItem('dailyCard_hardItems', JSON.stringify(this.state.hardItems));
    },

    loadProgress() {
        const stored = localStorage.getItem('dailyCard_progress');
        if (stored) {
            this.state.progress = JSON.parse(stored);
        } else {
            this.state.progress = {};
        }
    },

    incrementProgress(partId) {
        if (!partId) return;
        if (!this.state.progress[partId]) this.state.progress[partId] = 0;
        this.state.progress[partId]++;
        localStorage.setItem('dailyCard_progress', JSON.stringify(this.state.progress));
    },

    showLoading(show) {
        if (show) document.getElementById('loading-overlay').classList.remove('hidden');
        else document.getElementById('loading-overlay').classList.add('hidden');
    }
};

// Start
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
