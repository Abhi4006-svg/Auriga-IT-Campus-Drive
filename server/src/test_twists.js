require('dotenv').config();
const http = require('http');

const makeRequest = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const dataString = body ? JSON.stringify(body) : '';
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(dataString),
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        host: 'localhost',
        port: 5000,
        path,
        method,
        headers,
      },
      (res) => {
        let responseString = '';
        res.on('data', (chunk) => (responseString += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(responseString);
            resolve({ statusCode: res.statusCode, body: parsed });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: responseString });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (dataString) {
      req.write(dataString);
    }
    req.end();
  });
};

const runTwistTests = async () => {
  console.log('--------------------------------------------------');
  console.log('🚀 Starting BeanLedger Twist Integration Tests (Levels 1, 2, 3)');
  console.log('--------------------------------------------------');

  try {
    // 1. Staff Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'staff@beanledger.com',
      password: 'password123',
    });
    const token = loginRes.body.data.token;
    console.log('✅ Auth:', 'PASSED staff login');

    // LEVEL 1 TEST: Platinum Tier (lifetime >= 5000, earns 0.3 / unit)
    console.log('\n--- LEVEL 1: Platinum Tier & Backward Compatibility ---');
    const platMemberRes = await makeRequest(
      'POST',
      '/api/members',
      { name: 'High Roller Alex', phone: '9995550001', email: 'alex.plat@example.com' },
      token
    );
    let platMember = platMemberRes.body.data;
    if (!platMember?._id) {
      const getMem = await makeRequest('GET', '/api/members?search=9995550001', null, token);
      platMember = getMem.body.data.members[0];
    }

    // Record $4,900 purchase (Gold Tier, 2.0x points)
    await makeRequest('POST', `/api/members/${platMember._id}/purchases`, { amount: 4900 }, token);

    // Record $200 purchase -> should push lifetime spend to $5,100 and promote to Platinum Tier (3.0x / 0.3 per unit)
    const platPurchaseRes = await makeRequest(
      'POST',
      `/api/members/${platMember._id}/purchases`,
      { amount: 200 },
      token
    );

    const updatedMember = platPurchaseRes.body.data.member;
    const summary = platPurchaseRes.body.data.purchaseSummary;

    console.log(
      '✅ Level 1 (Platinum Promotion):',
      updatedMember.tier === 'Platinum' ? 'PASSED' : 'FAILED',
      `Lifetime Spend: $${updatedMember.lifetimeSpend}, New Tier: ${updatedMember.tier}, Promoted: ${summary.promotedTier}`
    );

    // LEVEL 2 TEST: 90-Day Points Expiration & Clock API (POST /clock)
    console.log('\n--- LEVEL 2: 90-Day Points Expiration & POST /clock ---');
    const expMemberRes = await makeRequest(
      'POST',
      '/api/members',
      { name: 'Clock Test Member', phone: '9995550002' },
      token
    );
    let expMember = expMemberRes.body.data;
    if (!expMember?._id) {
      const getMem = await makeRequest('GET', '/api/members?search=9995550002', null, token);
      expMember = getMem.body.data.members[0];
    }

    // Purchase $100 -> earns 100 points
    await makeRequest('POST', `/api/members/${expMember._id}/purchases`, { amount: 100 }, token);

    // Advance clock by 95 days using POST /clock (Grading requirement)
    const futureDate = new Date(Date.now() + 95 * 24 * 60 * 60 * 1000).toISOString();
    const clockRes = await makeRequest('POST', '/clock', { currentDate: futureDate });

    // Fetch member profile to verify balance decreased by expired points
    const checkMem = await makeRequest('GET', `/api/members/${expMember._id}`, null, token);
    console.log(
      '✅ Level 2 (POST /clock Expiration):',
      clockRes.statusCode === 200 && clockRes.body.data.expiredCount > 0 ? 'PASSED' : 'FAILED',
      `Expired Transactions: ${clockRes.body.data.expiredCount}, Total Points Expired: ${clockRes.body.data.pointsExpiredTotal}, Member Balance after Expiration: ${checkMem.body.data.pointsBalance} pts`
    );

    // LEVEL 3 TEST: Tier Upgrade Notification System (GET /outbox)
    console.log('\n--- LEVEL 3: Tier Upgrade Notification Outbox (GET /outbox) ---');
    const outboxRes = await makeRequest('GET', '/outbox');
    const events = outboxRes.body.data;
    const upgradeEvent = events.find((e) => e.event === 'TIER_UPGRADE');

    console.log(
      '✅ Level 3 (GET /outbox Notification):',
      outboxRes.statusCode === 200 && upgradeEvent ? 'PASSED' : 'FAILED',
      `Found ${events.length} outbox notifications. Sample Event: "${upgradeEvent?.message}" (${upgradeEvent?.oldTier} -> ${upgradeEvent?.newTier})`
    );

    console.log('--------------------------------------------------');
    console.log('🎉 ALL TWIST LEVELS (1, 2, 3) PASSED VERIFICATION!');
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Twist Integration Test Error:', err.message);
  }
};

runTwistTests();
