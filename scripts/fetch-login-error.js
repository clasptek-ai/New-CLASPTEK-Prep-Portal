require('dotenv').config();

async function main() {
  const res = await fetch('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'audit.student.1786017074254@clasptek.org',
      password: 'Password123!',
    }),
  });

  console.log('HTTP Status:', res.status);
  const text = await res.text();
  console.log('Response Body:', text);
}

main().catch(console.error);
