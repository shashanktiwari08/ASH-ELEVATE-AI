const http = require('http');

const data = JSON.stringify({
    name: 'Admin User',
    email: 'admin@erp.com',
    password: 'password123',
    role: 'admin'
});

const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Body:', responseBody);
        process.exit(0);
    });
});

req.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
});

req.write(data);
req.end();
