const http = require('http');

const data = JSON.stringify({
    email: 'admin@erp.com',
    password: 'password123'
});

const loginOptions = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const loginReq = http.request(loginOptions, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Login Status:', res.statusCode);
        const setCookie = res.headers['set-cookie'];
        console.log('Set-Cookie:', setCookie);
        
        if (res.statusCode === 200) {
            const token = JSON.parse(body).token;
            console.log('Login successful, token received.');
            
            // Test /me endpoint
            const meOptions = {
                hostname: '127.0.0.1',
                port: 5000,
                path: '/api/auth/me',
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            };
            
            const meReq = http.request(meOptions, (meRes) => {
                let meBody = '';
                meRes.on('data', (chunk) => meBody += chunk);
                meRes.on('end', () => {
                    console.log('Me Status:', meRes.statusCode);
                    console.log('Me Body:', meBody);
                    process.exit(0);
                });
            });
            meReq.end();
        } else {
            console.error('Login failed:', body);
            process.exit(1);
        }
    });
});

loginReq.on('error', (err) => {
    console.error('Request error:', err);
    process.exit(1);
});

loginReq.write(data);
loginReq.end();
