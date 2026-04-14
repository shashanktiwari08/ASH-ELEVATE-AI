const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Client = require('../models/Client');
const Vendor = require('../models/Vendor');
const ServiceBoy = require('../models/ServiceBoy');

const protect = async (req, res, next) => {
    let token;
    
    // Check for token in cookies (http-only) or headers
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
        let user;
        
        // Load user based on type
        switch (decoded.userType) {
            case 'Client':
                user = await Client.findById(decoded.id);
                req.userType = 'Client';
                break;
            case 'Vendor':
                user = await Vendor.findById(decoded.id);
                req.userType = 'Vendor';
                break;
            case 'ServiceBoy':
                const Staff = require('../models/Staff');
                user = await Staff.findById(decoded.id);
                req.userType = 'ServiceBoy';
                break;
            default:
                user = await User.findById(decoded.id).select('-password');
                req.userType = 'Admin';
        }
        
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role ${req.user.role} is not authorized to access this route` });
        }
        next();
    };
};

module.exports = { protect, authorize };
