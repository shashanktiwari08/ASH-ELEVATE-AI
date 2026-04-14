const mongoose = require('mongoose');
const Client = require('../src/models/Client');
const Vendor = require('../src/models/Vendor');
const Staff = require('../src/models/Staff');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ash-elevate-ai';

const migratePins = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB for migration...');

        const updateModel = async (Model, name) => {
            const docs = await Model.find({ pin: { $exists: false } });
            console.log(`Found ${docs.length} ${name} documents without pins.`);
            for (let doc of docs) {
                doc.pin = Math.floor(1000 + Math.random() * 9000).toString();
                await doc.save();
            }
            console.log(`Updated ${name} documents.`);
        };

        await updateModel(Client, 'Client');
        await updateModel(Vendor, 'Vendor');
        await updateModel(Staff, 'Staff');

        console.log('Migration complete.');
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

migratePins();
