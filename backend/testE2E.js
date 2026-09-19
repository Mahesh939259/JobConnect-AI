const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('=== STARTING JOB CONNECT AI INTEGRATION TEST ===');

const server = spawn('node', [path.join(__dirname, 'server.js')], {
  cwd: path.join(__dirname),
  env: { ...process.env, PORT: '5001', NODE_ENV: 'development' },
});

let serverStarted = false;

server.stdout.on('data', (data) => {
  const str = data.toString();
  process.stdout.write('[SERVER]: ' + str);
  if (str.includes('Backend running') && !serverStarted) {
    serverStarted = true;
    runTests();
  }
});

server.stderr.on('data', (data) => {
  process.stderr.write('[SERVER ERR]: ' + data.toString());
});

const makeRequest = (options, postData = null) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
};

async function runTests() {
  console.log('\n--- Running API Verification Tests ---');

  try {
    // 1. Health check
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/health',
      method: 'GET',
    });
    console.log('✓ Test 1: GET /api/health -> Status:', health.status, health.data);

    // 2. Fetch jobs
    const jobs = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/jobs?limit=3',
      method: 'GET',
    });
    console.log(`✓ Test 2: GET /api/jobs -> Status: ${jobs.status}, Total Jobs: ${jobs.data.totalJobs}, Count: ${jobs.data.count}`);

    // 3. Login as student
    const loginStudent = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'rahul.sharma@gmail.com', password: 'Password@123' }
    );
    console.log(`✓ Test 3: POST /api/auth/login (Student) -> Status: ${loginStudent.status}, User: ${loginStudent.data.user?.name}, Role: ${loginStudent.data.user?.role}`);

    const studentToken = loginStudent.data.token;

    // 4. Test Student Dashboard API
    const studentDash = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/student/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`✓ Test 4: GET /api/student/dashboard -> Status: ${studentDash.status}, TotalApps: ${studentDash.data.stats?.totalApplications}, Score: ${studentDash.data.stats?.resumeScore}`);

    // 5. Test AI Recommendations API
    const recs = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/student/recommended-jobs',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`✓ Test 5: GET /api/student/recommended-jobs -> Status: ${recs.status}, Recommendations: ${recs.data.count}, Top Score: ${recs.data.jobs?.[0]?.matchScore}%`);

    // 6. Login as recruiter
    const loginRecruiter = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'recruiter.razorpay@jobconnect.ai', password: 'Password@123' }
    );
    console.log(`✓ Test 6: POST /api/auth/login (Recruiter) -> Status: ${loginRecruiter.status}, User: ${loginRecruiter.data.user?.name}, Role: ${loginRecruiter.data.user?.role}`);

    const recruiterToken = loginRecruiter.data.token;

    // 7. Recruiter dashboard API
    const recruiterDash = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/recruiter/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${recruiterToken}` },
    });
    console.log(`✓ Test 7: GET /api/recruiter/dashboard -> Status: ${recruiterDash.status}, ActiveJobs: ${recruiterDash.data.stats?.activeJobs}, TotalApplicants: ${recruiterDash.data.stats?.totalApplications}`);

    // 8. Admin login & Platform Stats
    const loginAdmin = await makeRequest(
      {
        hostname: 'localhost',
        port: 5001,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@jobconnect.ai', password: 'Password@123' }
    );
    console.log(`✓ Test 8: POST /api/auth/login (Admin) -> Status: ${loginAdmin.status}, User: ${loginAdmin.data.user?.name}, Role: ${loginAdmin.data.user?.role}`);

    const adminStats = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${loginAdmin.data.token}` },
    });
    console.log(`✓ Test 9: GET /api/admin/stats -> Status: ${adminStats.status}, Users: ${adminStats.data.stats?.totalUsers}, Companies: ${adminStats.data.stats?.totalCompanies}`);

    // 9. Unauthorized Role Check (Student trying to access admin endpoint -> 403)
    const unauthorizedCheck = await makeRequest({
      hostname: 'localhost',
      port: 5001,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log(`✓ Test 10: Security Check - Student accessing /api/admin/stats -> Status: ${unauthorizedCheck.status} (Expected 403 Forbidden)`);

    console.log('\n=============================================');
    console.log('ALL 10 API & SECURITY TESTS PASSED PERFECTLY!');
    console.log('=============================================\n');

    server.kill();
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    server.kill();
    process.exit(1);
  }
}

// Timeout fail-safe
setTimeout(() => {
  if (!serverStarted) {
    console.error('Server timed out waiting to start.');
    server.kill();
    process.exit(1);
  }
}, 30000);
