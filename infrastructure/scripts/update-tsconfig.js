const fs = require('fs');
const path = require('path');

const tsconfigs = [
  'apps/api-gateway/tsconfig.json',
  'services/user-service/tsconfig.json',
  'services/learning-service/tsconfig.json',
  'services/roadmap-service/tsconfig.json',
  'services/scheduler-service/tsconfig.json',
  'services/ai-service/tsconfig.json',
  'services/resource-document-service/tsconfig.json'
];

for (const f of tsconfigs) {
  const filepath = path.join(process.cwd(), f);
  if (fs.existsSync(filepath)) {
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const json = JSON.parse(content);
      json.include = ["src/**/*"];
      fs.writeFileSync(filepath, JSON.stringify(json, null, 2), 'utf8');
      console.log(`Updated tsconfig include glob in: ${f}`);
    } catch (err) {
      console.error(`Failed to update: ${f}`, err.message);
    }
  }
}

console.log('TSConfig files updated successfully!');
