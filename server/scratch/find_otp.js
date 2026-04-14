const mongoose = require('mongoose');
const Login = require('../src/models/Login');
require('dotenv').config({ path: '../.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ash-elevate-ai';

const findOTP = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const record = await Login.findOne({ Phone_Number: '9354384835' }).sort({ createdAt: -1 });
        if (record) {
            console.log('--- FOUND OTP IN DB ---');
            console.log('Phone:', record.Phone_Number);
            console.log('OTP:', record.OTP_Code);
            console.log('Expiry:', record.OTP_Expiry);
        } else {
            console.log('No OTP record found for this number.');
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

findOTP();
