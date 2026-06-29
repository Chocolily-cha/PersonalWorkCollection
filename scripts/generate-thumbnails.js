const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFMPEG_PATH = 'C:\\Program Files\\EVCapture\\ffmpeg.exe';
const PORTFOLIO_DIR = path.join(__dirname, '../public/巧克力的作品集');
const THUMB_DIR = path.join(__dirname, '../public/thumbnails');

if (!fs.existsSync(THUMB_DIR)) {
  fs.mkdirSync(THUMB_DIR, { recursive: true });
}

const categories = ['AI动画', '3D动画', '其它'];
const SAMPLE_TIME = 0.5;
const MAX_WIDTH = 1200;
const QUALITY = 75;

let total = 0;
let generated = 0;
let skipped = 0;

categories.forEach(category => {
  const catDir = path.join(PORTFOLIO_DIR, category);
  if (!fs.existsSync(catDir)) return;
  
  const files = fs.readdirSync(catDir);
  const mp4Files = files.filter(f => f.endsWith('.mp4'));
  
  mp4Files.forEach(mp4File => {
    total++;
    const mp4Path = path.join(catDir, mp4File);
    const thumbName = mp4File.replace('.mp4', '.jpg');
    const thumbPath = path.join(THUMB_DIR, thumbName);
    
    if (fs.existsSync(thumbPath)) {
      skipped++;
      console.log(`[跳过] ${thumbName} 已存在`);
      return;
    }
    
    try {
      const cmd = `"${FFMPEG_PATH}" -y -ss ${SAMPLE_TIME} -i "${mp4Path}" -vf "scale=${MAX_WIDTH}:-1" -q:v ${QUALITY} -frames:v 1 "${thumbPath}"`;
      execSync(cmd, { stdio: 'pipe' });
      generated++;
      console.log(`[成功] ${thumbName}`);
    } catch (err) {
      try {
        const cmd2 = `"${FFMPEG_PATH}" -y -ss 0 -i "${mp4Path}" -vf "scale=${MAX_WIDTH}:-1" -q:v ${QUALITY} -frames:v 1 "${thumbPath}"`;
        execSync(cmd2, { stdio: 'pipe' });
        generated++;
        console.log(`[成功-备用] ${thumbName}`);
      } catch (err2) {
        console.log(`[失败] ${thumbName}: ${err2.message}`);
      }
    }
  });
});

console.log(`\n统计: 总计 ${total} 个视频, 生成 ${generated} 个缩略图, 跳过 ${skipped} 个已存在`);
console.log('完成!');
