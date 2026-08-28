const userId = '736ec639-9646-4eea-ad6e-8f1f5199e5ab';
const roadmapId = '1dd30918-b264-4a94-b3b6-5a3f8474466d';

async function measure(name, url, method = 'GET', body = null) {
  const start = performance.now();
  const options = {
    method,
    headers: { 'x-user-id': userId, 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);
  
  try {
    const res = await fetch(url, options);
    const time = Math.round(performance.now() - start);
    let data = null;
    if (res.ok) {
      data = await res.json();
    }
    console.log(`[${name}] ${res.status} - ${time}ms`);
    return { status: res.status, data, time };
  } catch (err) {
    const time = Math.round(performance.now() - start);
    console.error(`[${name}] ERROR - ${time}ms - ${err.message}`);
    return { status: 500, error: err.message, time };
  }
}

async function verify() {
  console.log('--- STARTING PERFORMANCE AND DATA VERIFICATION ---\n');

  const goals = await measure('GET /learning-goals', 'http://localhost:4002/learning-goals');
  const roadmap = await measure('GET /roadmaps/by-goal/:id', `http://localhost:4003/roadmaps/by-goal/${roadmapId}`);
  const schedule = await measure('GET /schedule/current', `http://localhost:4004/schedule/current?roadmapId=${roadmapId}`);
  const today = await measure('GET /today', `http://localhost:4004/schedule/today?roadmapId=${roadmapId}`);
  const skills = await measure('GET /learning-goals/:id/skills', `http://localhost:4002/learning-goals/${roadmapId}/skills`);
  const docs = await measure('GET /documents', `http://localhost:4006/documents`);
  
  console.log('\n--- VERIFYING DATA INTEGRITY ---');
  
  if (schedule.data && schedule.data.tasks) {
    console.log(`Scheduled Tasks Count: ${schedule.data.tasks.length}`);
    const valid = schedule.data.tasks.every(t => t.skillNodeId && t.baselineDate && typeof t.isCompleted === 'boolean');
    console.log(`All scheduled tasks have valid structure: ${valid ? 'PASS' : 'FAIL'}`);
    
    // Check if skillNodeIds match the roadmap
    if (roadmap.data && roadmap.data.modules) {
      let canonicalSkillIds = [];
      roadmap.data.modules.forEach(m => m.skills.forEach(s => canonicalSkillIds.push(s.id)));
      const noOrphans = schedule.data.tasks.every(t => canonicalSkillIds.includes(t.skillNodeId));
      console.log(`No orphan scheduled tasks: ${noOrphans ? 'PASS' : 'FAIL'}`);
    }
  }

  console.log('\n--- SUMMARY PREPARATION FINISHED ---');
}

verify();
