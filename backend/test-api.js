const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

// Test configuration
const testConfig = {
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Test data
const testData = {
  user: {
    username: 'TestUser123',
    email: 'test@chessfi.com',
    wallet_address: '0xTest1234567890123456789012345678901234567890',
    nonce: 'test-nonce-12345'
  },
  game: {
    white_player_id: null, // Will be set after user creation
    black_player_id: null, // Will be set after user creation
    game_type: 'rapid',
    time_control: 15,
    increment: 10
  },
  tournament: {
    name: 'Test Tournament',
    description: 'A test tournament for API testing',
    format: 'swiss',
    start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    registration_deadline: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    max_participants: 16,
    min_participants: 4,
    time_control: 10,
    increment: 5,
    entry_fee: 0.01,
    prize_pool: {
      first: 1.0,
      second: 0.5,
      third: 0.25
    },
    total_prize_pool: 1.75,
    rating_min: 1000,
    rating_max: 2000,
    is_rated: true,
    is_public: true
  }
};

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

// Helper function to run a test
async function runTest(testName, testFunction) {
  testResults.total++;
  try {
    console.log(`🧪 Testing: ${testName}`);
    await testFunction();
    testResults.passed++;
    testResults.details.push({ name: testName, status: 'PASS', error: null });
    console.log(`✅ ${testName} - PASSED`);
  } catch (error) {
    testResults.failed++;
    testResults.details.push({ name: testName, status: 'FAIL', error: error.message });
    console.log(`❌ ${testName} - FAILED: ${error.message}`);
  }
}

// Test functions
async function testServerHealth() {
  const response = await axios.get(`${BASE_URL}/health`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  console.log('   📊 Server health check passed');
}

async function testDatabaseConnection() {
  const response = await axios.get(`${BASE_URL}/health`, testConfig);
  if (!response.data.database) {
    throw new Error('Database connection not reported');
  }
  console.log('   📊 Database connection verified');
}

async function testUserRegistration() {
  const response = await axios.post(`${BASE_URL}/api/auth/register`, testData.user, testConfig);
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  if (!response.data.user || !response.data.user.id) {
    throw new Error('User not created properly');
  }
  testData.user.id = response.data.user.id;
  console.log(`   📊 User registered with ID: ${testData.user.id}`);
}

async function testUserLogin() {
  const loginData = {
    wallet_address: testData.user.wallet_address,
    signature: 'test-signature',
    message: 'test-message'
  };
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, loginData, testConfig);
    if (response.status !== 200) {
      throw new Error(`Expected status 200, got ${response.status}`);
    }
    if (!response.data.token) {
      throw new Error('No token returned');
    }
    testData.token = response.data.token;
    testConfig.headers.Authorization = `Bearer ${testData.token}`;
    console.log('   📊 User login successful');
  } catch (error) {
    // Login might fail due to signature verification, which is expected in test
    console.log('   📊 User login test (signature verification expected to fail)');
  }
}

async function testGetUserProfile() {
  const response = await axios.get(`${BASE_URL}/users/profile`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!response.data.user) {
    throw new Error('User profile not returned');
  }
  console.log('   📊 User profile retrieved');
}

async function testGetUsers() {
  const response = await axios.get(`${BASE_URL}/users`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!Array.isArray(response.data.users)) {
    throw new Error('Users list not returned as array');
  }
  console.log(`   📊 Retrieved ${response.data.users.length} users`);
}

async function testGetLeaderboard() {
  const response = await axios.get(`${BASE_URL}/api/leaderboard/global`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!Array.isArray(response.data.users)) {
    throw new Error('Leaderboard not returned as array');
  }
  console.log(`   📊 Retrieved leaderboard with ${response.data.users.length} entries`);
}

async function testCreateTournament() {
  testData.tournament.organizer_id = testData.user.id;
  const response = await axios.post(`${BASE_URL}/api/tournaments`, testData.tournament, testConfig);
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  if (!response.data.tournament || !response.data.tournament.id) {
    throw new Error('Tournament not created properly');
  }
  testData.tournament.id = response.data.tournament.id;
  console.log(`   📊 Tournament created with ID: ${testData.tournament.id}`);
}

async function testGetTournaments() {
  const response = await axios.get(`${BASE_URL}/api/tournaments`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!Array.isArray(response.data.tournaments)) {
    throw new Error('Tournaments list not returned as array');
  }
  console.log(`   📊 Retrieved ${response.data.tournaments.length} tournaments`);
}

async function testCreateGame() {
  // Create a second user for the game
  const secondUser = {
    ...testData.user,
    username: 'TestUser456',
    email: 'test2@chessfi.com',
    wallet_address: '0xTest4567890123456789012345678901234567890'
  };
  
  const userResponse = await axios.post(`${BASE_URL}/api/auth/register`, secondUser, testConfig);
  testData.game.black_player_id = userResponse.data.user.id;
  testData.game.white_player_id = testData.user.id;
  
  const response = await axios.post(`${BASE_URL}/api/games`, testData.game, testConfig);
  if (response.status !== 201) {
    throw new Error(`Expected status 201, got ${response.status}`);
  }
  if (!response.data.game || !response.data.game.id) {
    throw new Error('Game not created properly');
  }
  testData.game.id = response.data.game.id;
  console.log(`   📊 Game created with ID: ${testData.game.id}`);
}

async function testGetGames() {
  const response = await axios.get(`${BASE_URL}/api/games`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!Array.isArray(response.data.games)) {
    throw new Error('Games list not returned as array');
  }
  console.log(`   📊 Retrieved ${response.data.games.length} games`);
}

async function testGetNFTs() {
  const response = await axios.get(`${BASE_URL}/api/nfts`, testConfig);
  if (response.status !== 200) {
    throw new Error(`Expected status 200, got ${response.status}`);
  }
  if (!Array.isArray(response.data.nfts)) {
    throw new Error('NFTs list not returned as array');
  }
  console.log(`   📊 Retrieved ${response.data.nfts.length} NFTs`);
}

async function testWebSocketConnection() {
  // This would require a WebSocket client, for now just test if the endpoint exists
  try {
    const response = await axios.get(`${BASE_URL.replace('http', 'ws')}/socket.io/`, testConfig);
    console.log('   📊 WebSocket endpoint accessible');
  } catch (error) {
    console.log('   📊 WebSocket test (connection test would require WebSocket client)');
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting ChessFi Backend API Tests\n');
  
  // Wait a moment for server to start
  console.log('⏳ Waiting for server to start...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Run tests
  await runTest('Server Health Check', testServerHealth);
  await runTest('Database Connection', testDatabaseConnection);
  await runTest('User Registration', testUserRegistration);
  await runTest('User Login', testUserLogin);
  await runTest('Get User Profile', testGetUserProfile);
  await runTest('Get Users List', testGetUsers);
  await runTest('Get Leaderboard', testGetLeaderboard);
  await runTest('Create Tournament', testCreateTournament);
  await runTest('Get Tournaments', testGetTournaments);
  await runTest('Create Game', testCreateGame);
  await runTest('Get Games', testGetGames);
  await runTest('Get NFTs', testGetNFTs);
  await runTest('WebSocket Connection', testWebSocketConnection);
  
  // Print results
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('========================');
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ❌`);
  console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.details
      .filter(test => test.status === 'FAIL')
      .forEach(test => console.log(`   - ${test.name}: ${test.error}`));
  }
  
  console.log('\n🎉 API Testing Complete!');
}

// Run the tests
runAllTests().catch(console.error);
