const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    businessName: { type: String }, // For SaaS: The company/business name
    businessId: { type: String, index: true }, // The unique tenant ID for scoping data
    role: { type: String, enum: ['admin', 'manager'], default: 'admin' },
    avatar: { type: String },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
    if (!this.businessId) {
        this.businessId = 'BIZ' + Math.random().toString(36).substring(2, 8).toUpperCase();
    }
});

userSchema.pre('save', async function() {
    console.log('User pre-save hook triggered for:', this.email);
    if (!this.isModified('password')) {
        console.log('Password not modified, skipping hash');
        return;
    }
    console.log('Hashing password...');
    this.password = await bcrypt.hash(this.password, 10);
    console.log('Password hashed successfully');
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
