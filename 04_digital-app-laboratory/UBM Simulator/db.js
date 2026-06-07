// db.js - Native IndexedDB Implementation for UT Mobile Exam Simulator

const DB_NAME = 'ut-mobile-exam-db';
const DB_VERSION = 1;

// Helper to wrap IDBRequest in Promise
function prom(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const DB_CORE = {
    dbInstance: null,

    async open() {
        if (this.dbInstance) return this.dbInstance;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                // Store for Exams
                if (!db.objectStoreNames.contains('exams')) {
                    const examStore = db.createObjectStore('exams', { keyPath: 'id' });
                    examStore.createIndex('createdAt', 'createdAt');
                }
                // Store for Sessions
                if (!db.objectStoreNames.contains('sessions')) {
                    const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
                    sessionStore.createIndex('examId', 'examId');
                }
            };

            request.onsuccess = (e) => {
                this.dbInstance = e.target.result;
                this.dbInstance.onclose = () => {
                    this.dbInstance = null;
                };
                resolve(this.dbInstance);
            };

            request.onerror = (e) => reject(e.target.error);
        });
    }
};

const DB = {
    // --- EXAMS ---
    async saveExam(exam) {
        const db = await DB_CORE.open();
        return prom(db.transaction('exams', 'readwrite').objectStore('exams').put(exam));
    },

    async getAllExams() {
        const db = await DB_CORE.open();
        return prom(db.transaction('exams', 'readonly').objectStore('exams').getAll());
    },

    async getExam(id) {
        const db = await DB_CORE.open();
        return prom(db.transaction('exams', 'readonly').objectStore('exams').get(id));
    },

    async deleteExam(id) {
        const db = await DB_CORE.open();
        return prom(db.transaction('exams', 'readwrite').objectStore('exams').delete(id));
    },

    // --- SESSIONS ---
    async saveSession(session) {
        const db = await DB_CORE.open();
        return prom(db.transaction('sessions', 'readwrite').objectStore('sessions').put(session));
    },

    async getSession(id) {
        const db = await DB_CORE.open();
        return prom(db.transaction('sessions', 'readonly').objectStore('sessions').get(id));
    },

    async getAllSessions() {
        const db = await DB_CORE.open();
        return prom(db.transaction('sessions', 'readonly').objectStore('sessions').getAll());
    },

    async deleteSessionsByExam(examId) {
        const db = await DB_CORE.open();
        const tx = db.transaction('sessions', 'readwrite');
        const store = tx.objectStore('sessions');
        const all = await prom(store.getAll());
        for (const s of all) {
            if (s.examId === examId) {
                store.delete(s.id);
            }
        }
    }
};

window.DB = DB;
