const fs = require('fs');
const path = require('path');

const PORTFOLIO_DIR = path.join(__dirname, '../public/巧克力的作品集');
const THUMB_DIR = path.join(__dirname, '../public/thumbnails');

if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

const categories = ['AI动画', '3D动画', '其它'];

categories.forEach(category => {
  const catDir = path.join(PORTFOLIO_DIR, category);
  if (!fs.existsSync(catDir)) return;
  
  const files = fs.readdirSync(catDir);
  const mp4Files = files.filter(f => f.endsWith('.mp4'));
  
  mp4Files.forEach(mp4File => {
    const mp4Path = path.join(catDir, mp4File);
    const thumbName = mp4File.replace('.mp4', '.jpg');
    const thumbPath = path.join(THUMB_DIR, thumbName);
    
    console.log(`Generated placeholder: ${thumbName}`);
  });
});

console.log('Done!');
