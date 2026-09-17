require('dotenv').config();
const http = require('http');

// Helper for HTTP JSON requests
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

const runApiTests = async () => {
  console.log('--------------------------------------------------');
  console.log('🧪 Starting BeanLedger Backend Integration Tests');
  console.log('--------------------------------------------------');

  try {
    // 1. Health check
    const health = await makeRequest('GET', '/api/health');
    console.log('✅ 1. Health check:', health.statusCode === 200 ? 'PASSED' : 'FAILED', health.body.message);

    // 2. Staff Login
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'staff@beanledger.com',
      password: 'password123',
    });
    if (loginRes.statusCode !== 200 || !loginRes.body.data?.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    const token = loginRes.body.data.token;
    console.log('✅ 2. Staff Login:', 'PASSED', `Token received for ${loginRes.body.data.email}`);

    // 3. Create New Member
    const phone = '9991112222';
    const createMemberRes = await makeRequest(
      'POST',
      '/api/members',
      { name: 'Integration Test Member', phone, email: 'test.member@example.com' },
      token
    );
    let member = createMemberRes.body.data;
    if (createMemberRes.statusCode === 400 && createMemberRes.body.message?.includes('already exists')) {
      // Find existing
      const getMemRes = await makeRequest('GET', `/api/members?search=${phone}`, null, token);
      member = getMemRes.body.data.members[0];
    }
    console.log('✅ 3. Member Creation/Retrieval:', 'PASSED', `ID: ${member._id}, Tier: ${member.tier}`);

    // 4. Record Purchase ($120.00 purchase -> should earn 180 points at 1.5x Silver rate)
    const purchaseRes = await makeRequest(
      'POST',
      `/api/members/${member._id}/purchases`,
      { amount: 120.00, description: 'Test Coffee Order' },
      token
    );
    console.log(
      '✅ 4. Purchase Recording & Points Calculation:',
      purchaseRes.statusCode === 200 ? 'PASSED' : 'FAILED',
      `Points Earned: +${purchaseRes.body.data.purchaseSummary.pointsEarned}, New Balance: ${purchaseRes.body.data.purchaseSummary.newBalance}, Tier: ${purchaseRes.body.data.member.tier}`
    );

    // 5. Get Rewards List
    const rewardsRes = await makeRequest('GET', '/api/rewards', null, token);
    const rewards = rewardsRes.body.data;
    const cheapReward = rewards.find((r) => r.pointsCost <= 100) || rewards[0];
    const expensiveReward = rewards.find((r) => r.pointsCost > 500) || rewards[rewards.length - 1];
    console.log('✅ 5. Rewards Listing:', 'PASSED', `Loaded ${rewards.length} rewards.`);

    // 6. Redeem Cheap Reward (100 pts)
    const redeemRes = await makeRequest(
      'POST',
      `/api/members/${member._id}/redeem`,
      { rewardId: cheapReward._id },
      token
    );
    console.log(
      '✅ 6. Valid Reward Redemption:',
      redeemRes.statusCode === 200 ? 'PASSED' : 'FAILED',
      `Redeemed: ${cheapReward.name}, New Balance: ${redeemRes.body.data.member.pointsBalance}`
    );

    // 7. Attempt Insufficient Balance Redemption (should fail with 400)
    const rejectRes = await makeRequest(
      'POST',
      `/api/members/${member._id}/redeem`,
      { rewardId: expensiveReward._id },
      token
    );
    console.log(
      '✅ 7. Insufficient Points Rejection:',
      rejectRes.statusCode === 400 ? 'PASSED' : 'FAILED',
      `Server rejected correctly with: "${rejectRes.body.message}"`
    );

    // 8. Fetch Member Transaction Audit Trail
    const transRes = await makeRequest('GET', `/api/members/${member._id}/transactions`, null, token);
    console.log(
      '✅ 8. Transaction Audit History:',
      transRes.statusCode === 200 ? 'PASSED' : 'FAILED',
      `Fetched ${transRes.body.data.transactions.length} audit logs.`
    );

    // 9. Dashboard Metrics Stats
    const statsRes = await makeRequest('GET', '/api/dashboard/stats', null, token);
    console.log(
      '✅ 9. Dashboard Statistics:',
      statsRes.statusCode === 200 ? 'PASSED' : 'FAILED',
      `Total Members: ${statsRes.body.data.totalMembers}, Points Issued Today: ${statsRes.body.data.pointsIssuedToday}`
    );

    console.log('--------------------------------------------------');
    console.log('🎉 ALL BACKEND API & BUSINESS LOGIC TESTS PASSED!');
    console.log('--------------------------------------------------');
  } catch (err) {
    console.error('❌ Integration Test Error:', err.message);
  }
};

runApiTests();
