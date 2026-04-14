const mongoose = require('mongoose');
const User = require('./src/models/User');
const Client = require('./src/models/Client');
const Vendor = require('./src/models/Vendor');
const Staff = require('./src/models/Staff');
const Booking = require('./src/models/Booking');
const Invoice = require('./src/models/Invoice');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system';

const seedData = async () => {
    try {
        console.log('Connecting to MONGO_URI:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Client.deleteMany({});
        await Vendor.deleteMany({});
        await Staff.deleteMany({});
        await Booking.deleteMany({});
        await Invoice.deleteMany({});

        // Create Admin
        console.log('Creating Admin user...');
        const admin = await User.create({
            name: 'Shashank Tiwari',
            email: 'admin@erp.com',
            password: 'password123',
            role: 'admin'
        });
        console.log('Admin user created successfully:', admin.email);

        // Create Sample Clients
        console.log('Creating sample clients...');
        await Client.insertMany([
            { name: 'Aditya Gupta', companyName: 'Elite Events', phone: '9876543210', email: 'aditya@elite.com', status: 'active' },
            { name: 'Rohan Sharma', companyName: 'Royal Weddings', phone: '9988776655', email: 'rohan@royal.com', status: 'active' },
            { name: 'Ananya Singh', companyName: 'Party Planners', phone: '9123456789', email: 'ananya@party.com', status: 'inactive' }
        ]);
        console.log('Sample clients created.');

        // Create Sample Vendors
        console.log('Creating sample vendors...');
        await Vendor.insertMany([
            { name: 'Modern Decorators', serviceType: 'Decorator', phone: '8877665544', email: 'decor@modern.com' },
            { name: 'Star Catering', serviceType: 'Caterer', phone: '8080808080', email: 'star@cater.com' }
        ]);
        console.log('Sample vendors created.');

        // Create Sample Staff
        console.log('Creating sample staff...');
        await Staff.insertMany([
            { name: 'Rahul Kumar', phone: '7766554433', email: 'rahul@staff.com', role: 'waiter', paymentPerDay: 500 },
            { name: 'Priya Verma', phone: '7070707070', email: 'priya@staff.com', role: 'decorator', paymentPerDay: 800 }
        ]);
        console.log('Sample staff created.');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding data FULL:', error);
        process.exit(1);
    }
};

seedData();
