const { spawn } = require('child_process');
const fs = require('fs');

const build = spawn('npx', ['next', 'build'], {
  cwd: __dirname,
  stdio: ['inherit', 'pipe', 'pipe'],
  shell: true
});

const logStream = fs.createWriteStream('build-output-full.txt', { flags: 'w' });

build.stdout.on('data', (data) => {
  console.log(data.toString());
  logStream.write(data.toString());
});

build.stderr.on('data', (data) => {
  console.error(data.toString());
  logStream.write('STDERR: ' + data.toString());
});

build.on('close', (code) => {
  logStream.write(`\nBuild exited with code ${code}\n`);
  logStream.close();
  
  setTimeout(() => {
    if (fs.existsSync('dist')) {
      console.log('\n=== dist directory contents ===');
      fs.readdirSync('dist').forEach(file => {
        console.log(file);
      });
    } else {
      console.log('\n=== dist directory does NOT exist ===');
    }
    
    if (fs.existsSync('.next/static')) {
      console.log('\n=== .next/static directory contents ===');
      fs.readdirSync('.next/static').forEach(file => {
        console.log(file);
      });
    } else {
      console.log('\n=== .next/static directory does NOT exist ===');
    }
  }, 1000);
});