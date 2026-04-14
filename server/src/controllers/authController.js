const User = require('../models/User');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const ServiceBoy = require('../models/ServiceBoy');
const Login = require('../models/Login');
const jwt = require('jsonwebtoken');

const generateToken = (id, userType) => {
    return jwt.sign({ id, userType }, process.env.JWT_SECRET || 'secret123', {
        expiresIn: '30d',
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (simulated - replace with actual SMS service in production)
const sendOTP = async (phoneNumber, otp, userType) => {
    console.log(`[OTP SENT] To: ${phoneNumber}, OTP: ${otp}, Type: ${userType}`);
    return true;
};

exports.registerUser = async (req, res) => {
    const { name, email, password, role, businessName } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });
        
        const user = await User.create({ name, email, password, role, businessName });
        
        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 });
        
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            businessName: user.businessName,
            businessId: user.businessId,
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const token = generateToken(user._id);
            res.cookie('token', token, { httpOnly: true, secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                businessName: user.businessName,
                businessId: user.businessId,
                token
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.logoutUser = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.status(200).json({ message: 'Logged out successfully' });
};

exports.getMe = async (req, res) => {
    // req.user is already populated by protect middleware
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
    
    res.json({
        ...req.user._doc,
        role: (req.userType || 'Admin').toLowerCase(),
        token
    });
};

// Generate OTP for login
exports.generateLoginOTP = async (req, res) => {
    const { userType, phoneNumber, serviceBoyId } = req.body;
    console.log('--- OTP REQUEST DEBUG ---', { userType, phoneNumber, body: req.body });
    
    try {
        let user;
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Validate user exists based on type
        switch (userType) {
            case 'Client':
                user = await Client.findOne({ phone: phoneNumber });
                if (!user) return res.status(404).json({ message: 'Client not found' });
                break;
                
            case 'Vendor':
                user = await Vendor.findOne({ phone: phoneNumber });
                if (!user) return res.status(404).json({ message: 'Vendor not found' });
                break;
                
            case 'ServiceBoy':
                const StaffModel = require('../models/Staff');
                if (serviceBoyId) {
                    user = await StaffModel.findOne({ serviceBoyId });
                } else {
                    user = await StaffModel.findOne({ phone: phoneNumber });
                }
                if (!user) return res.status(404).json({ message: 'Service Boy not found' });
                break;
                
            default:
                return res.status(400).json({ message: 'Invalid user type' });
        }

        // Save OTP to Login collection
        await Login.findOneAndUpdate(
            { User_Type: userType, Phone_Number: phoneNumber || user.Phone_Number },
            { OTP_Code: otp, OTP_Expiry: otpExpiry },
            { upsert: true, new: true }
        );

        // Send OTP
        await sendOTP(phoneNumber || user.Phone_Number, otp, userType);

        res.status(200).json({ 
            message: 'OTP sent successfully', 
            otpSent: true,
            expiresIn: '10 minutes'
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Verify PIN and login (formerly verifyLoginOTP)
exports.verifyLoginPIN = async (req, res) => {
    const { userType, phoneNumber, pin, serviceBoyId } = req.body;
    
    try {
        let user;
        
        // Find user details based on type
        switch (userType) {
            case 'Client':
                user = await Client.findOne({ phone: phoneNumber });
                break;
            case 'Vendor':
                user = await Vendor.findOne({ phone: phoneNumber });
                break;
            case 'ServiceBoy':
                const Staff = require('../models/Staff');
                if (serviceBoyId) {
                    user = await Staff.findOne({ serviceBoyId });
                } else {
                    user = await Staff.findOne({ phone: phoneNumber });
                }
                break;
            default:
                return res.status(400).json({ message: 'Invalid user type' });
        }

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Verify PIN
        if (user.pin !== pin) {
            return res.status(401).json({ message: 'Invalid Login PIN' });
        }

        // Generate token
        const token = generateToken(user._id, userType);
        
        // Set cookie
        res.cookie('token', token, { 
            httpOnly: true, 
            secure: false, 
            maxAge: 30 * 24 * 60 * 60 * 1000 
        });

        // Return user data and token
        res.json({
            _id: user._id,
            userType,
            role: userType.toLowerCase(),
            businessId: user.businessId,
            name: user.name,
            phone: user.phone,
            ...(userType === 'ServiceBoy' && { serviceBoyId: user.serviceBoyId }),
            token
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
