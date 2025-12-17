// db.js - Native IndexedDB Implementation (No External Dependencies)

const DB_NAME = 'exam-sim-db';
const DB_VERSION = 1;

// Helper to wrap request in Promise
function prom(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

const DB_CORE = {
    async open() {
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

            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    },

    async runTransaction(storeName, mode, callback) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);

            let result;
            try {
                result = callback(store);
            } catch (err) {
                reject(err);
                return;
            }

            // For readwrite, we might need to wait for tx completion
            // For simple requests, we can just return the request promise
            if (result instanceof IDBRequest) {
                result.onsuccess = () => resolve(result.result);
                result.onerror = () => reject(result.error);
            } else {
                // If callback returns something else (like null or a value), just resolve it
                // But usually we return the request.
                // If we need to wait for transaction complete:
                tx.oncomplete = () => resolve(result); // This might be tricky if result is not what we want
                tx.onerror = () => reject(tx.error);
            }
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
    }
};

window.DB = DB;
