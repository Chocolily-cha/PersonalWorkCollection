const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FFMPEG_PATH = 'C:\\Program Files\\EVCapture\\ffmpeg.exe';
const PORTFOLIO_DIR = path.join(__dirname, '../public/巧克力的作品集');
const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const categories = ['AI动画', '3D动画', '其它'];
const MAX_SIZE_MB = 15;
const MAX_WIDTH = 960;
const BITRATE = '1.5M';

let totalSaved = 0;
let processed = 0;
let skipped = 0;

categories.forEach(category => {
  const catDir = path.join(PORTFOLIO_DIR, category);
  if (!fs.existsSync(catDir)) return;
  
  const files = fs.readdirSync(catDir);
  const mp4Files = files.filter(f => f.endsWith('.mp4'));
  
  mp4Files.forEach(mp4File => {
    const mp4Path = path.join(catDir, mp4File);
    const stats = fs.statSync(mp4Path);
    const sizeMB = stats.size / (1024 * 1024);
    
    if (sizeMB <= MAX_SIZE_MB) {
      skipped++;
      console.log(`[跳过] ${mp4File} - ${sizeMB.toFixed(2)} MB (小于${MAX_SIZE_MB}MB)`);
      return;
    }
    
    processed++;
    const tempInput = path.join(TEMP_DIR, 'input.mp4');
    const tempOutput = path.join(TEMP_DIR, 'output.mp4');
    const originalSize = stats.size;
    
    console.log(`[处理] ${mp4File} - ${sizeMB.toFixed(2)} MB...`);
    
    try {
      fs.copyFileSync(mp4Path, tempInput);
      const cmd = `"${FFMPEG_PATH}" -y -i "${tempInput}" -vf "scale=${MAX_WIDTH}:-1" -b:v ${BITRATE} -preset veryfast -c:a copy -movflags +faststart "${tempOutput}"`;
      execSync(cmd, { stdio: 'pipe' });
      
      const newSize = fs.statSync(tempOutput).size;
      const savedMB = (originalSize - newSize) / (1024 * 1024);
      totalSaved += savedMB;
      
      fs.copyFileSync(tempOutput, mp4Path);
      fs.unlinkSync(tempInput);
      fs.unlinkSync(tempOutput);
      
      console.log(`[成功] ${mp4File} - 压缩后 ${(newSize / (1024 * 1024)).toFixed(2)} MB (节省 ${savedMB.toFixed(2)} MB)`);
    } catch (err) {
      console.log(`[失败] ${mp4File}: ${err.message}`);
      if (fs.existsSync(tempInput)) fs.unlinkSync(tempInput);
      if (fs.existsSync(tempOutput)) fs.unlinkSync(tempOutput);
    }
  });
});

console.log(`\n统计: 处理 ${processed} 个, 跳过 ${skipped} 个, 总共节省 ${totalSaved.toFixed(2)} MB`);
console.log('完成!');