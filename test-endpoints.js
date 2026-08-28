async function test() {
  const userId = '736ec639-9646-4eea-ad6e-8f1f5199e5ab';
  const roadmapId = '1dd30918-b264-4a94-b3b6-5a3f8474466d';
  
  const headers = { 'x-user-id': userId };

  try {
    const res1 = await fetch(`http://localhost:4002/learning-goals/${roadmapId}/skills`, { headers });
    console.log('Skills Status:', res1.status);
  } catch (err) {
    console.error('Skills Error:', err.message);
  }

  try {
    const res2 = await fetch(`http://localhost:4002/learning-goals/${roadmapId}/progress`, { headers });
    console.log('Progress Status:', res2.status);
  } catch (err) {
    console.error('Progress Error:', err.message);
  }

  try {
    const res3 = await fetch(`http://localhost:4004/schedule/current?roadmapId=${roadmapId}`, { headers });
    const data = await res3.json();
    console.log('Schedule Status:', res3.status, 'Tasks:', data.tasks?.length);
  } catch (err) {
    console.error('Schedule Error:', err.message);
  }
}

test();
