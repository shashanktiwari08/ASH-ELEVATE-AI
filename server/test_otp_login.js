const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/auth';

async function testOTPLogin() {
    console.log('Testing OTP Login System...\n');
    
    try {
        // Test 1: Generate OTP for Client
        console.log('1. Testing Client OTP generation:');
        const clientOtpRes = await axios.post(`${API_BASE}/generate-otp`, {
            userType: 'Client',
            phoneNumber: '9876543210'
        });
        console.log('✓ Client OTP generated:', clientOtpRes.data);
        
        // Test 2: Generate OTP for Vendor
        console.log('\n2. Testing Vendor OTP generation:');
        const vendorOtpRes = await axios.post(`${API_BASE}/generate-otp`, {
            userType: 'Vendor',
            phoneNumber: '9876543211'
        });
        console.log('✓ Vendor OTP generated:', vendorOtpRes.data);
        
        // Test 3: Generate OTP for ServiceBoy
        console.log('\n3. Testing ServiceBoy OTP generation:');
        const sbOtpRes = await axios.post(`${API_BASE}/generate-otp`, {
            userType: 'ServiceBoy',
            phoneNumber: '9876543212'
        });
        console.log('✓ ServiceBoy OTP generated:', sbOtpRes.data);
        
        console.log('\n✅ All OTP generation endpoints working correctly!');
        console.log('\nCheck your server console for the generated OTP codes.');
        console.log('Use verify-otp endpoint with the OTP from console to complete login.');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testOTPLogin();
