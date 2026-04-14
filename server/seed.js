const mongoose = require('mongoose');
const User = require('./src/models/User');
const Client = require('./src/models/Client');
const Vendor = require('./src/models/Vendor');
const Staff = require('./src/models/Staff');
const ServiceBoy = require('./src/models/ServiceBoy');
const Booking = require('./src/models/Booking');
const Invoice = require('./src/models/Invoice');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ash-elevate-ai';

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Client.deleteMany({});
        await Vendor.deleteMany({});
        await Staff.deleteMany({});
        await ServiceBoy.deleteMany({});
        await Booking.deleteMany({});
        await Invoice.deleteMany({});

        // Create Admin
        const admin = await User.create({
            name: 'Diwakar Tiwari',
            email: 'admin@erp.com',
            password: 'password123',
            businessName: 'ASH ELEVATE AI',
            role: 'admin'
        });
        console.log('Admin user created successfully:', admin.businessId);

        // Create Sample Clients
        await Client.create([
            { name: 'Aditya Gupta', phone: '9876543210', email: 'aditya@elite.com', businessId: admin.businessId },
            { name: 'Rohan Sharma', phone: '9988776655', email: 'rohan@royal.com', businessId: admin.businessId }
        ]);
        console.log('Sample clients created.');

        // Create Sample Vendors
        await Vendor.create([
            { name: 'Modern Decorators', serviceType: 'Decorator', phone: '8877665544', businessId: admin.businessId },
            { name: 'Star Catering', serviceType: 'Caterer', phone: '8080808080', businessId: admin.businessId }
        ]);
        console.log('Sample vendors created.');

        // Create Sample Staff (one by one to trigger pre-save hook for IDs)
        await Staff.create({ name: 'Rahul Kumar', phone: '7766554433', skillCategory: 'waiter', baseRate: 500, businessId: admin.businessId });
        await Staff.create({ name: 'Priya Verma', phone: '7070707070', skillCategory: 'loader', baseRate: 800, businessId: admin.businessId });
        
        console.log('Sample staff created.');

        console.log('Database seeded fully and successfully.');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
