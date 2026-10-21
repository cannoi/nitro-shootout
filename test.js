const assert = require('assert');
const http = require('http');

const PORT = process.env.PORT || 8080;

// Start server test
require('./server.js');

setTimeout(() => {
  http.get(`http://127.0.0.1:${PORT}/health`, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        assert.strictEqual(parsed.status, 'healthy');
        console.log('✅ Test passed: Server is healthy.');
        process.exit(0);
      } catch (err) {
        console.error('❌ Test failed parsing health response:', err);
        process.exit(1);
      }
    });
  }).on('error', err => {
    console.error('❌ Test failed connecting to server:', err);
    process.exit(1);
  });
}, 1000);
