const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file === 'node_modules' || file === '.git' || file === '.turbo') {
        return;
      }
      if (file === 'dist' || file === '.next') {
        results.push(fullPath);
      } else {
        results = results.concat(walk(fullPath));
      }
    } else {
      if (file === 'tsconfig.tsbuildinfo') {
        results.push(fullPath);
      }
    }
  });
  return results;
};

const itemsToDelete = walk(process.cwd());
console.log(`Found ${itemsToDelete.length} build artifacts to delete.`);

for (const item of itemsToDelete) {
  try {
    if (fs.statSync(item).isDirectory()) {
      fs.rmSync(item, { recursive: true, force: true });
    } else {
      fs.unlinkSync(item);
    }
    console.log(`Deleted: ${item}`);
  } catch (err) {
    console.error(`Failed to delete: ${item}`, err.message);
  }
}

console.log('Build artifacts cleaned successfully!');
