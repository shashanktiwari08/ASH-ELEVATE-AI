const mongoose = require('mongoose');
const User = require('./src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system';

const createAdminUser = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Delete existing admin if exists
        await User.deleteOne({ email: 'admin@erp.com' });
        
        // Create new admin user
        const user = await User.create({
            name: 'Admin User',
            email: 'admin@erp.com',
            password: 'admin@123',
            role: 'admin',
            businessName: 'AEROSKY HOSPITALITY'
        });

        console.log('✅ ADMIN USER CREATED SUCCESSFULLY!');
        console.log('');
        console.log('📧 Email:    admin@erp.com');
        console.log('🔑 Password: admin@123');
        console.log('🏢 Business ID:', user.businessId);
        console.log('');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin:', error);
        process.exit(1);
    }
};

createAdminUser();