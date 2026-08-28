const authUser = { id: 'd290f1ee-6c54-4b01-90e6-d701748f0851' };
const formData = {
  topic: 'Hindi',
  currentLevel: 'Beginner',
  dailyTime: '30 mins'
};
const formattedContext = "Travel";

async function run() {
  const goalRes = await fetch('http://localhost:4000/api/v1/learning-goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': authUser.id },
    body: JSON.stringify({
      skillName: formData.topic,
      currentLevel: formData.currentLevel,
      targetLevel: 'advanced',
      dailyMinutes: 30,
      learningDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    })
  });
  if (!goalRes.ok) {
    console.error('learning-goals failed:', await goalRes.text());
    return;
  }
  const goalData = await goalRes.json();
  const goalId = goalData.id;
  console.log('Goal ID:', goalId);

  const roadmapGenRes = await fetch('http://localhost:4000/api/v1/roadmaps/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': authUser.id },
    body: JSON.stringify({
      prompt: `Create a curriculum for ${formData.topic} from ${formData.currentLevel} to advanced. Additional learner context: ${formattedContext}`,
      learningGoalId: goalId
    })
  });
  if (!roadmapGenRes.ok) {
    console.error('roadmaps/generate failed:', await roadmapGenRes.text());
    return;
  }
  console.log('roadmaps/generate success');

  const roadmapRes = await fetch(`http://localhost:4000/api/v1/roadmaps/by-goal/${goalId}`, {
    headers: { 'x-user-id': authUser.id }
  });
  if (!roadmapRes.ok) {
    console.error('roadmaps/by-goal failed:', await roadmapRes.text());
    return;
  }
  const roadmap = await roadmapRes.json();
  console.log('Roadmap ID:', roadmap.id);

  const tasks = [];
  if (roadmap.modules) {
    roadmap.modules.forEach((mod) => {
      if (mod.skills) {
        mod.skills.forEach((skill) => {
          const deps = roadmap.prerequisites
            ?.filter((p) => p.targetSkillNodeId === skill.id)
            .map((p) => p.requiredSkillNodeId) || [];
          tasks.push({
            skillNodeId: skill.id,
            estimatedMinutes: skill.estimatedMinutes || 30,
            prerequisites: deps
          });
        });
      }
    });
  }

  const scheduleRes = await fetch('http://localhost:4000/api/v1/schedule/baseline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': authUser.id },
    body: JSON.stringify({
      roadmapId: goalId,
      tasks
    })
  });
  if (!scheduleRes.ok) {
    console.error('schedule/baseline failed:', await scheduleRes.text());
    return;
  }
  console.log('schedule/baseline success');
}

run().catch(console.error);
