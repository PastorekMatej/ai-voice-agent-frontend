// DOCKER IMPLEMENTATION: Health check script for container monitoring

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 80,
  path: '/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  if (res.statusCode === 200) {
    console.log('✅ Frontend container is healthy');
    process.exit(0);
  } else {
    console.log('❌ Frontend container health check failed');
    process.exit(1);
  }
});

req.on('error', (error) => {
  console.log('❌ Frontend container health check error:', error.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Frontend container health check timeout');
  req.destroy();
  process.exit(1);
});

req.end(); 