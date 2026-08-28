const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'public', 'avatars');

async function convertAll() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  for (const file of files) {
    const src = path.join(dir, file);
    const dest = path.join(dir, file.replace('.png', '.webp'));
    console.log(`Converting ${file} to WEBP...`);
    await sharp(src)
      .webp({ quality: 80 })
      .toFile(dest);
    // Delete original PNG
    fs.unlinkSync(src);
  }
  console.log('Conversion complete!');
}

convertAll().catch(console.error);
