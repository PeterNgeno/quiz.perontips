const { collection, addDoc } = require('firebase/firestore');
const db = require('../db');

const Notification = {
    async createNotification(data) {
        return await addDoc(collection(db, 'notifications'), data);
    },
};

module.exports = Notification;