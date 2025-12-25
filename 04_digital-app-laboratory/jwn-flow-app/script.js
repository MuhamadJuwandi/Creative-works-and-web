// CONSTANTS & STATE
const APP_KEY = 'upgrade_diri_v3';
const START_DATE = '2025-12-26';

const SCHEDULE = {
    1: [
        { time: '05.00', task: 'Bangun + Subuh', icon: 'Sun' },
        { time: '05.30-06.30', task: 'Jalan ringan / beres kamar', icon: 'Activity' },
        { time: '06.30-08.00', task: 'Nonton ulang materi kuliah / listening Jepang santai', icon: 'Play' },
        { time: '08.00-11.00', task: 'Kerja mekanis / administrasi', icon: 'Briefcase' },
        { time: '11.30-12.00', task: 'Tidur siang (maks. 30 menit)', icon: 'Moon' },
        { time: '12.00-17.30', task: 'Kerja ringan', icon: 'Briefcase' },
        { time: '18.30', task: 'Makan malam', icon: 'Utensils' },
        { time: '20.30', task: 'HP off, lampu diredupkan', icon: 'Power-off' },
        { time: '21.30-22.00', task: 'Tidur', icon: 'Bed' }
    ],
    2: [
        { time: '05.00', task: 'Bangun + Subuh', icon: 'Sun' },
        { time: '06.00-07.30', task: 'Baca catatan UAS (tanpa soal)', icon: 'Book' },
        { time: '07.30-08.30', task: 'Listening Jepang pasif', icon: 'Headphones' },
        { time: '08.30-11.00', task: 'Kerja mekanis', icon: 'Briefcase' },
        { time: '12.00-12.20', task: 'Tidur siang', icon: 'Moon' },
        { time: '12.20-17.30', task: 'Kerja ringan', icon: 'Briefcase' },
        { time: '18.30', task: 'Makan malam', icon: 'Utensils' },
        { time: '21.30', task: 'Tidur', icon: 'Bed' }
    ],
    3: [
        { time: '04.30', task: 'Bangun + Subuh', icon: 'Sun' },
        { time: '05.00-06.30', task: 'Rangkum rumus UAS / review grammar', icon: 'Book' },
        { time: '06.30-08.30', task: 'Kerja ringan / review', icon: 'Briefcase' },
        { time: '12.00-12.20', task: 'Tidur siang', icon: 'Moon' },
        { time: '17.30', task: 'Makan malam', icon: 'Utensils' },
        { time: '21.00', task: 'Tidur', icon: 'Bed' }
    ],
    4: [
        { time: '04.00', task: 'Bangun + Subuh', icon: 'Sun' },
        { time: '04.30-06.30', task: 'Soal lama UAS / kanji lama', icon: 'Book' },
        { time: '06.30-09.00', task: 'Kerja ringan / review', icon: 'Briefcase' },
        { time: '12.00-12.20', task: 'Tidur siang', icon: 'Moon' },
        { time: '20.30-21.00', task: 'Tidur', icon: 'Bed' }
    ],
    5: [
        { time: '03.30', task: 'Bangun', icon: 'Bell' },
        { time: '04.00-04.30', task: 'Tahajud (ringan)', icon: 'Moon' },
        { time: '04.30-07.30', task: 'Materi baru UAS / grammar baru', icon: 'Book-Open' },
        { time: '07.30-09.00', task: 'Review singkat', icon: 'Check-Circle' },
        { time: '12.00-12.20', task: 'Tidur siang', icon: 'Moon' },
        { time: '20.30', task: 'Tidur', icon: 'Bed' }
    ],
    6: [
        { time: '03.00', task: 'Bangun', icon: 'Bell' },
        { time: '03.00-04.00', task: 'Tahajud', icon: 'Moon' },
        { time: '04.00-08.00', task: 'Soal baru UAS / kanji + reading', icon: 'Book' },
        { time: '08.00-09.00', task: 'Duha + istirahat', icon: 'Coffee' },
        { time: '11.45-12.05', task: 'Tidur siang', icon: 'Moon' },
        { time: '20.00-20.30', task: 'Tidur', icon: 'Bed' }
    ],
    7: [
        { time: '02.00', task: 'Bangun', icon: 'Bell' },
        { time: '02.00-03.00', task: 'Tahajud (1 jam)', icon: 'Moon' },
        { time: '03.00-08.30', task: 'Belajar fokus (UAS + Jepang)', icon: 'Brain' },
        { time: '09.00-11.00', task: 'Kerja mekanis', icon: 'Briefcase' },
        { time: '12.00-12.20', task: 'Tidur siang', icon: 'Moon' },
        { time: '19.30-20.00', task: 'Tidur', icon: 'Bed' }
    ]
};

const ATURAN_INTI = `
<h3><i class="fa-solid fa-scale-balanced"></i> Aturan Inti</h3>
<ul>
    <li>Tidak tidur setelah Subuh.</li>
    <li>Tidur siang <strong>maks. 30 menit</strong>.</li>
    <li>Tidak kerja fisik malam (nyuci, beres berat).</li>
    <li>Jika satu hari meleset -> <strong>lanjut ke hari berikutnya</strong> (tidak ulang).</li>
</ul>
`;

// STATE & INIT
let state = {
    history: {},
    todos: [],
    journal: [],
    monthlyTargets: {}
};

let currentCalDate = new Date();

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    renderApp();
    renderCalendar();
});

function loadState() {
    const saved = localStorage.getItem(APP_KEY);
    if (saved) {
        state = JSON.parse(saved);
        if (!state.history) state.history = {};
        if (!state.journal) state.journal = [];
        if (!state.todos) state.todos = [];
        if (!state.monthlyTargets) state.monthlyTargets = {};
    }
}

function saveState() {
    localStorage.setItem(APP_KEY, JSON.stringify(state));
}

function getDayNumber() {
    const start = new Date(START_DATE);
    const today = new Date();
    const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = todayMidnight - startMidnight;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
}

function renderApp() {
    const dayNum = getDayNumber();
    const todayStr = new Date().toISOString().split('T')[0];

    renderDate();

    // Dynamic Schedule Logic
    const scheduleDays = Object.keys(SCHEDULE).map(Number).sort((a, b) => a - b);
    const lastDefinedDay = scheduleDays[scheduleDays.length - 1];
    let activeDay = dayNum;

    const titleEl = document.getElementById('level-title');
    const progressText = document.getElementById('progress-greeting');
    const streakEl = document.getElementById('streak-count');

    if (dayNum < 1) {
        titleEl.innerText = "Persiapan";
        progressText.innerText = `Mulai Besok: ${new Date(START_DATE).toLocaleDateString('id-ID')}`;
        streakEl.innerText = "0";
        renderEmptyState(`Istirahat yang cukup. Perjuangan dimulai besok!`);
        document.getElementById('daily-percent').innerText = "0%";
        document.getElementById('daily-progress-circle').style.background = "#333";
        renderTodos();
    } else {
        if (dayNum > lastDefinedDay) {
            activeDay = lastDefinedDay;
            titleEl.innerText = `Hari ${dayNum}`;
            progressText.innerText = `Fase Maintenance (Jadwal Hari ${activeDay})`;
        } else {
            titleEl.innerText = `HARI ${dayNum}`;
            progressText.innerText = "Fokus target hari ini.";
        }
        renderHabits(activeDay, todayStr);
        renderTodos();
        streakEl.innerText = dayNum;
    }

    const planContent = document.getElementById('user-plan-content');
    if (planContent) planContent.innerHTML = ATURAN_INTI;

    const currentMonthKey = todayStr.substring(0, 7);
    const targetText = state.monthlyTargets[currentMonthKey] || "Belum ada target bulan ini.";
    const planTargetEl = document.getElementById('plan-monthly-target-text');
    if (planTargetEl) {
        planTargetEl.innerText = targetText;
        planTargetEl.style.color = state.monthlyTargets[currentMonthKey] ? 'var(--text-main)' : 'var(--text-sec)';
    }

    renderJournal();
}

function renderHabits(dayIndex, dateStr) {
    const list = document.getElementById('habit-list');
    list.innerHTML = '';

    const tasks = SCHEDULE[dayIndex];
    if (!tasks) {
        list.innerHTML = `<div class="empty-state"><p>Tidak ada jadwal hari ini.</p></div>`;
        return;
    }

    const completedIndices = state.history[dateStr] || [];
    let completedCount = 0;

    tasks.forEach((item, idx) => {
        const isDone = completedIndices.includes(idx);
        if (isDone) completedCount++;

        const el = document.createElement('div');
        el.className = `habit-item ${isDone ? 'completed' : ''}`;
        el.onclick = () => toggleTask(dateStr, idx);

        el.innerHTML = `
            <div class="habit-left">
                <div class="checkbox-custom">
                    ${isDone ? '<i class="fa-solid fa-check" style="color:#000"></i>' : ''}
                </div>
                <div class="habit-info">
                    <div class="habit-time">${item.time}</div>
                    <div class="habit-name">${item.task}</div>
                </div>
            </div>
            <i class="fa-solid fa-${item.icon} primary-icon"></i>
        `;
        list.appendChild(el);
    });

    const percent = Math.round((completedCount / tasks.length) * 100);
    document.getElementById('daily-percent').innerText = `${percent}%`;
    document.getElementById('daily-progress-circle').style.background =
        `conic-gradient(var(--accent-color) ${percent}%, #333 0%)`;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    const monthYearEl = document.getElementById('calendar-month-year');
    const inputTarget = document.getElementById('monthly-target-input');

    if (!grid) return;
    grid.innerHTML = '';

    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();

    const monthNames = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    monthYearEl.innerText = `${monthNames[month]} ${year}`;

    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
    inputTarget.value = state.monthlyTargets[monthKey] || "";

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let startCol = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = 0; i < startCol; i++) {
        const div = document.createElement('div');
        div.className = 'calendar-day empty';
        grid.appendChild(div);
    }

    const todayStr = new Date().toISOString().split('T')[0];

    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const div = document.createElement('div');

        const hasHistory = state.history[dateStr] && state.history[dateStr].length > 0;
        const hasJournal = state.journal.some(j => j.date.includes(new Date(dateStr).toLocaleDateString()));

        let className = 'calendar-day';
        if (dateStr === todayStr) className += ' today';
        if (hasHistory || hasJournal) className += ' has-data';

        div.className = className;
        div.onclick = () => openDateDetail(dateStr);

        let html = `<span>${d}</span>`;
        if (hasHistory) html += `<span class="dot-indicator"></span>`;

        div.innerHTML = html;
        grid.appendChild(div);
    }
}

window.changeMonth = function (delta) {
    currentCalDate.setMonth(currentCalDate.getMonth() + delta);
    renderCalendar();
}

window.saveMonthlyTarget = function () {
    const txt = document.getElementById('monthly-target-input').value;
    const year = currentCalDate.getFullYear();
    const month = currentCalDate.getMonth();
    const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    if (txt.trim() === "") {
        delete state.monthlyTargets[monthKey];
    } else {
        state.monthlyTargets[monthKey] = txt;
    }
    saveState();
    renderApp();
}

window.openDateDetail = function (dateStr) {
    const modal = document.getElementById('date-modal');
    const title = document.getElementById('modal-date-title');
    const taskList = document.getElementById('modal-task-list');
    const journalList = document.getElementById('modal-journal-list');

    const dateObj = new Date(dateStr);
    title.innerText = dateObj.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    const completedIndices = state.history[dateStr] || [];
    const start = new Date(START_DATE);
    const targetDate = new Date(dateStr);
    const diffTime = targetDate - start;
    const dayNum = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    taskList.innerHTML = '';

    if (dayNum > 0 && completedIndices.length > 0) {
        const scheduleDays = Object.keys(SCHEDULE).map(Number).sort((a, b) => a - b);
        const lastDefinedDay = scheduleDays[scheduleDays.length - 1];
        let useDay = dayNum;
        if (dayNum > lastDefinedDay) useDay = lastDefinedDay;

        const tasks = SCHEDULE[useDay] || [];

        completedIndices.forEach(idx => {
            if (tasks[idx]) {
                taskList.innerHTML += `<li class="completed-task"><i class="fa-solid fa-check"></i> ${tasks[idx].task}</li>`;
            }
        });
    }

    if (taskList.innerHTML === '') {
        taskList.innerHTML = '<li style="opacity:0.6; background:none;">Tidak ada data tugas terselesaikan.</li>';
    }

    const targetLocaleDate = dateObj.toLocaleDateString();

    const relevantJournals = state.journal.filter(j => {
        return j.date.startsWith(targetLocaleDate) || j.date.includes(targetLocaleDate);
    });

    journalList.innerHTML = '';
    if (relevantJournals.length > 0) {
        relevantJournals.forEach(j => {
            journalList.innerHTML += `
                <div style="background:var(--surface-color); padding:10px; border-radius:8px; margin-bottom:8px;">
                    <div style="font-size:0.75rem; color:var(--primary-color); margin-bottom:4px;">${j.date.split(',')[1] || ''}</div>
                    <div>${j.text}</div>
                </div>`;
        });
    } else {
        journalList.innerHTML = '<p style="opacity:0.6; font-style:italic;">Tidak ada catatan.</p>';
    }

    modal.classList.remove('hidden');
}

window.closeModal = function () {
    document.getElementById('date-modal').classList.add('hidden');
}

function renderTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    list.innerHTML = '';
    if (state.todos.length === 0) {
        list.innerHTML = '<div class="empty-state"><p style="opacity:0.6; text-align:center;">Belum ada tugas tambahan.</p></div>';
        return;
    }
    state.todos.forEach((todo, idx) => {
        const el = document.createElement('div');
        el.className = `habit-item ${todo.completed ? 'completed' : ''}`;
        el.innerHTML = `
            <div class="habit-left" onclick="toggleTodo(${idx})">
                <div class="checkbox-custom">
                    ${todo.completed ? '<i class="fa-solid fa-check" style="color:#000"></i>' : ''}
                </div>
                <div class="habit-name">${todo.text}</div>
            </div>
            <i class="fa-solid fa-trash" style="color:var(--danger); cursor:pointer;" onclick="deleteTodo(${idx})"></i>
        `;
        list.appendChild(el);
    });
}
window.addTodo = function () {
    const input = document.getElementById('todo-input');
    const text = input.value.trim();
    if (!text) return;
    state.todos.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    input.value = '';
    saveState();
    renderTodos();
    showToast("Tugas ditambahkan!");
}
window.toggleTodo = function (idx) {
    state.todos[idx].completed = !state.todos[idx].completed;
    saveState();
    renderTodos();
}
window.deleteTodo = function (idx) {
    if (confirm('Hapus tugas ini?')) {
        state.todos.splice(idx, 1);
        saveState();
        renderTodos();
    }
}

function renderEmptyState(msg) {
    const list = document.getElementById('habit-list');
    list.innerHTML = `<div class="empty-state"><p style="text-align:center; opacity:0.7;">${msg}</p></div>`;
}

function toggleTask(dateStr, index) {
    if (!state.history[dateStr]) state.history[dateStr] = [];
    const arr = state.history[dateStr];
    const existingIdx = arr.indexOf(index);
    if (existingIdx > -1) {
        arr.splice(existingIdx, 1);
    } else {
        arr.push(index);
    }
    saveState();
    renderApp();
    renderCalendar();
}

function renderDate() {
    const opts = { weekday: 'long', day: 'numeric', month: 'short' };
    const dateStr = new Date().toLocaleDateString('id-ID', opts);
    const el = document.getElementById('current-date');
    if (el) el.innerText = dateStr;
}

// FIXED TAB LOGIC: Habits, To-Do, Plan, Journal, Calendar
window.switchTab = function (tabName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));

    document.getElementById(`view-${tabName}`).classList.add('active');

    const tabMap = {
        'habits': 0,
        'todo': 1,
        'plan': 2,
        'journal': 3,
        'calendar': 4
    };

    const btns = document.querySelectorAll('.tab-btn');
    if (tabMap[tabName] !== undefined && btns[tabMap[tabName]]) {
        btns[tabMap[tabName]].classList.add('active');
    }

    if (tabName === 'calendar') renderCalendar();
}

window.saveJournal = function () {
    const txt = document.getElementById('journal-input').value;
    if (!txt.trim()) return;
    state.journal.unshift({
        date: new Date().toLocaleString(),
        text: txt
    });
    document.getElementById('journal-input').value = '';
    saveState();
    renderJournal();
    showToast("Jurnal disimpan.");
}

function renderJournal() {
    const container = document.getElementById('journal-history');
    if (!container) return;
    container.innerHTML = state.journal.map(entry => `
        <div class="journal-card">
            <div class="journal-date">${entry.date}</div>
            <p>${entry.text}</p>
        </div>
    `).join('');
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerText = msg;
    t.classList.remove('hidden');
    setTimeout(() => t.classList.add('hidden'), 3000);
}
