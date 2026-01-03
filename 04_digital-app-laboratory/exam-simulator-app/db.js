// db.js - Robust Database (IDB + Memory Fallback)

const DB_NAME = 'exam-sim-db';
const DB_VERSION = 1;
let USE_MEMORY_DB = false;
let dbInstance = null; // Singleton Connection

const MEMORY_REQ = {
    exams: {},
    sessions: {}
};

// Helper: Timeout Promise
const timeoutWrapper = (promise, ms = 2000) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('DB_TIMEOUT')), ms);
    promise
        .then(res => { clearTimeout(timer); resolve(res); })
        .catch(err => { clearTimeout(timer); reject(err); });
});

// Helper: Promisify IDB Request
function prom(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const DB_CORE = {
    async open() {
        if (USE_MEMORY_DB) return null;
        if (dbInstance) return dbInstance;

        return new Promise((resolve, reject) => {
            if (!('indexedDB' in window)) return reject(new Error('NO_IDB_SUPPORT'));

            const request = indexedDB.open(DB_NAME, DB_VERSION);
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('exams')) {
                    db.createObjectStore('exams', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('sessions')) {
                    db.createObjectStore('sessions', { keyPath: 'id' });
                }
            };
            request.onsuccess = (e) => {
                dbInstance = e.target.result;
                // Handle unexpected close
                dbInstance.onclose = () => { dbInstance = null; };
                dbInstance.onversionchange = () => { dbInstance.close(); dbInstance = null; };
                resolve(dbInstance);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    },

    close() {
        if (dbInstance) {
            dbInstance.close();
            dbInstance = null;
        }
    },

    async init() {
        try {
            await timeoutWrapper(this.open(), 2500);
            console.log('IndexedDB Connection: OK (Singleton)');
        } catch (err) {
            console.warn('IndexedDB Failed/Blocked. Switching to Memory DB.', err);
            USE_MEMORY_DB = true;
        }
    }
};

const DB = {
    async _checkReady() { },

    // --- EXAMS ---
    async saveExam(exam) {
        if (USE_MEMORY_DB) {
            MEMORY_REQ.exams[exam.id] = exam;
            return;
        }
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('exams', 'readwrite').objectStore('exams').put(exam));
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.saveExam(exam);
        }
    },

    async getAllExams() {
        if (USE_MEMORY_DB) {
            return Object.values(MEMORY_REQ.exams);
        }
        try {
            const db = await DB_CORE.open(); // Uses singleton
            // No timeout wrapper needed here if init passed, but let's be safe?
            // Actually, if db passed init, open returns object immediately.
            return await prom(db.transaction('exams', 'readonly').objectStore('exams').getAll());
        } catch (e) {
            console.warn('GetExams failed', e);
            USE_MEMORY_DB = true;
            return this.getAllExams();
        }
    },

    async getExam(id) {
        if (USE_MEMORY_DB) return MEMORY_REQ.exams[id];
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('exams', 'readonly').objectStore('exams').get(id));
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.getExam(id);
        }
    },

    async deleteExam(id) {
        if (USE_MEMORY_DB) {
            delete MEMORY_REQ.exams[id];
            return;
        }
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('exams', 'readwrite').objectStore('exams').delete(id));
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.deleteExam(id);
        }
    },

    // --- SESSIONS ---
    async saveSession(session) {
        if (USE_MEMORY_DB) {
            MEMORY_REQ.sessions[session.id] = session;
            return;
        }
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('sessions', 'readwrite').objectStore('sessions').put(session));
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.saveSession(session);
        }
    },

    async getSession(id) {
        if (USE_MEMORY_DB) return MEMORY_REQ.sessions[id];
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('sessions', 'readonly').objectStore('sessions').get(id));
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.getSession(id);
        }
    },

    async getAllSessions() {
        if (USE_MEMORY_DB) return Object.values(MEMORY_REQ.sessions);
        try {
            const db = await DB_CORE.open();
            return await prom(db.transaction('sessions', 'readonly').objectStore('sessions').getAll());
        } catch (e) {
            USE_MEMORY_DB = true;
            return this.getAllSessions();
        }
    },

    async reset() {
        if (USE_MEMORY_DB) {
            MEMORY_REQ.exams = {};
            MEMORY_REQ.sessions = {};
            location.reload();
            return;
        }
        if (!confirm('Hapus semua data permanen?')) return;

        // Close header before deleting
        DB_CORE.close();

        try {
            const req = indexedDB.deleteDatabase(DB_NAME);
            req.onsuccess = () => location.reload();
            req.onerror = () => alert('Gagal reset.');
            req.onblocked = () => alert('Database blocked. Close other tabs.');
        } catch (e) {
            alert('Gagal reset: ' + e);
        }
    },

    // Expose Init for App control
    async init() {
        return DB_CORE.init();
    }
};

window.DB = DB;
