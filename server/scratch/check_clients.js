const mongoose = require('mongoose');
const Client = require('../src/models/Client');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ash-elevate-ai';

const checkClients = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const clients = await Client.find({});
        console.log('--- ALL CLIENTS IN DB ---');
        console.log(JSON.stringify(clients, null, 2));
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkClients();
