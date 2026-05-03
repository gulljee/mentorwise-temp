const http = require('http');

const boundary = 'FormBoundary' + Math.random().toString(36).slice(2);

const fields = {
    googleId: 'test_google_id_123',
    email: 'testgoogle_debug@test.com',
    firstName: 'Test',
    lastName: 'User',
    phoneNumber: '3001234567',
    batch: 'F22',
    department: 'CS',
    campus: 'PUCIT',
    role: 'Mentee'
};

let body = '';
for (const [k, v] of Object.entries(fields)) {
    body += '--' + boundary + '\r\n';
    body += 'Content-Disposition: form-data; name="' + k + '"\r\n\r\n';
    body += v + '\r\n';
}
body += '--' + boundary + '--\r\n';

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/google/complete',
    method: 'POST',
    headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body)
    }
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        try {
            const parsed = JSON.parse(data);
            console.log('RESPONSE:', JSON.stringify(parsed, null, 2));
        } catch (e) {
            console.log('RAW RESPONSE:', data);
        }
    });
});

req.on('error', (e) => {
    console.error('REQUEST ERROR:', e.message);
});

req.write(body);
req.end();
