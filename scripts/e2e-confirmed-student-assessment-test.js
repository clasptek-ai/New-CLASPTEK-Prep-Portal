require('dotenv').config();

async function main() {
  console.log('================================================================');
  console.log('    STEP 4: CONFIRMED STUDENT ASSESSMENT 401 INVESTIGATION      ');
  console.log('================================================================\n');

  const email = 'audit.student.1786017074254@clasptek.org'; // Confirmed user from Step 2
  const password = 'Password123!';

  console.log(`1. Logging in as CONFIRMED student: ${email}...`);
  const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  console.log(` - Login HTTP Status: ${loginRes.status}`);
  const setCookieHeaders = loginRes.headers.getSetCookie
    ? loginRes.headers.getSetCookie()
    : [loginRes.headers.get('set-cookie')].filter(Boolean);
  console.log(' - Set-Cookie Headers received:', setCookieHeaders);

  const loginJson = await loginRes.json();
  console.log(' - Login Response Body keys:', Object.keys(loginJson));
  console.log(' - Login User ID:', loginJson.user?.id);
  console.log(' - Login Session present in JSON?:', !!loginJson.session);

  // 2. Test GET /api/v1/assessment-attempts using received Set-Cookie headers
  console.log('\n2. Testing GET /api/v1/assessment-attempts using Cookie header...');
  const cookieHeaderValue = setCookieHeaders.map((c) => c.split(';')[0]).join('; ');

  const attemptResWithCookie = await fetch('http://localhost:3000/api/v1/assessment-attempts', {
    method: 'GET',
    headers: {
      Cookie: cookieHeaderValue,
    },
  });

  console.log(` - Assessment API HTTP Status (with Cookie): ${attemptResWithCookie.status}`);
  const attemptCookieJson = await attemptResWithCookie.json();
  console.log(' - Assessment API Response:', attemptCookieJson);

  // 3. Test GET /api/v1/assessment-attempts without Cookie or Authorization header (Simulating Mobile WebKit dropped cookie)
  console.log(
    '\n3. Testing GET /api/v1/assessment-attempts without Cookie or Authorization (Mobile WebKit Cookie Loss Simulation)...'
  );
  const attemptResNoAuth = await fetch('http://localhost:3000/api/v1/assessment-attempts', {
    method: 'GET',
  });

  console.log(` - Assessment API HTTP Status (no Cookie/Auth): ${attemptResNoAuth.status}`);
  const attemptNoAuthJson = await attemptResNoAuth.json();
  console.log(' - Assessment API Response:', attemptNoAuthJson);
}

main().catch((err) => {
  console.error('Step 4 Exception:', err);
  process.exit(1);
});
