import { app } from '../server/dist/app.js';
import { storage } from '../server/dist/storage/InMemoryStorage.js';

async function runLiveVerification() {
  console.log('--- 1. Testing Backend Startup without MongoDB ---');
  const server = app.listen(5099, async () => {
    console.log('Server started successfully on port 5099 with ZERO MongoDB dependencies!');

    try {
      // 1. Health check
      console.log('--- 2. Testing GET /api/v1/health ---');
      const healthRes = await fetch('http://localhost:5099/api/v1/health');
      const healthData = await healthRes.json();
      console.log('Health Response:', JSON.stringify(healthData, null, 2));

      if (healthData.storage.type !== 'in-memory') {
        throw new Error('Expected storage.type to be in-memory');
      }

      // 2. Create verification
      console.log('--- 3. Testing POST /api/v1/verifications ---');
      const postRes = await fetch('http://localhost:5099/api/v1/verifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: 'The speed of light in vacuum is approximately 299,792,458 meters per second.',
          debateRounds: 2,
        }),
      });
      const postData = await postRes.json();
      console.log('POST Response:', JSON.stringify(postData, null, 2));

      if (postRes.status !== 202 || !postData.data.id) {
        throw new Error('Failed to create verification');
      }

      const id = postData.data.id;

      // 3. Status check
      console.log(`--- 4. Testing GET /api/v1/verifications/${id} ---`);
      const getRes = await fetch(`http://localhost:5099/api/v1/verifications/${id}`);
      const getData = await getRes.json();
      console.log('GET Detail Response (Initial):', getData.data.status, getData.data.claim);

      // 4. History check
      console.log('--- 5. Testing GET /api/v1/verifications ---');
      const listRes = await fetch('http://localhost:5099/api/v1/verifications?page=1&limit=10');
      const listData = await listRes.json();
      console.log('History Count:', listData.data.length);

      // 5. Search check
      console.log('--- 6. Testing GET /api/v1/verifications/search?q=speed ---');
      const searchRes = await fetch('http://localhost:5099/api/v1/verifications/search?q=speed');
      const searchData = await searchRes.json();
      console.log('Search Match Count:', searchData.data.length);

      // 6. Delete check
      console.log(`--- 7. Testing DELETE /api/v1/verifications/${id} ---`);
      const delRes = await fetch(`http://localhost:5099/api/v1/verifications/${id}`, {
        method: 'DELETE',
      });
      console.log('Delete Status:', delRes.status);

      // Verify deletion
      const afterDelRes = await fetch(`http://localhost:5099/api/v1/verifications/${id}`);
      console.log('GET After Delete Status:', afterDelRes.status);

      console.log('\n--- In-Memory Backend Verification Completed Successfully! ---');
    } catch (err) {
      console.error('Verification script failed:', err);
      process.exitCode = 1;
    } finally {
      server.close(() => {
        console.log('Server closed cleanly.');
      });
    }
  });
}

runLiveVerification();

