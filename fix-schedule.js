const userId = '736ec639-9646-4eea-ad6e-8f1f5199e5ab';

async function fixSchedule() {
  try {
    const resGoals = await fetch('http://localhost:4002/learning-goals', { headers: { 'x-user-id': userId }});
    const goals = await resGoals.json();
    console.log('Goals found:', goals.length);
    goals.forEach(g => console.log('Goal ID:', g.id, 'Skill:', g.skillName, 'Created:', g.createdAt));
    
    // The prompt says 1dd30918-b264-4a94-b3b6-5a3f8474466d is the valid one.
    const roadmapId = '1dd30918-b264-4a94-b3b6-5a3f8474466d';
    
    console.log('\nFetching roadmap for goal:', roadmapId);
    const res1 = await fetch(`http://localhost:4003/roadmaps/by-goal/${roadmapId}`, { headers: { 'x-user-id': userId }});
    if (!res1.ok) {
       console.log('Roadmap Status:', res1.status, await res1.text());
       return;
    }
    const roadmap = await res1.json();
    console.log('Roadmap ID:', roadmap.id);
    
    const tasks = [];
    if (roadmap.modules) {
      roadmap.modules.forEach(mod => {
        if (mod.skills) {
          mod.skills.forEach(skill => {
            const deps = roadmap.prerequisites
              ?.filter(p => p.targetSkillNodeId === skill.id)
              .map(p => p.requiredSkillNodeId) || [];
              
            tasks.push({
              skillNodeId: skill.id,
              estimatedMinutes: skill.estimatedMinutes || 30,
              prerequisites: deps
            });
          });
        }
      });
    }
    console.log('Tasks to schedule:', tasks.length);
    
    const res2 = await fetch('http://localhost:4004/schedule/baseline', {
      method: 'POST',
      headers: { 'x-user-id': userId, 'Content-Type': 'application/json' },
      body: JSON.stringify({ roadmapId, tasks })
    });
    
    if (res2.ok) {
       console.log('Baseline generated successfully.');
    } else {
       console.error('Baseline failed:', res2.status, await res2.text());
    }
    
    const res3 = await fetch(`http://localhost:4004/schedule/current?roadmapId=${roadmapId}`, { headers: { 'x-user-id': userId }});
    const schedule = await res3.json();
    console.log('Current Schedule Tasks:', schedule.tasks?.length);
  } catch (err) {
    console.error(err.message);
  }
}
fixSchedule();
