const mongoose = require('mongoose');
const Client = require('../src/models/Client');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ash-elevate-ai';

const fixClientPhone = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const result = await Client.updateOne(
            { phone: '934384835' }, 
            { $set: { phone: '9354384835' } }
        );
        console.log('Update result:', result);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

fixClientPhone();
