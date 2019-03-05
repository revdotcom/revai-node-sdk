const fs = require('fs');
const path = require('path');

let filename = 'README.md';
let src = path.join(__dirname, filename);
let destDir = path.join(__dirname, 'dist');

fs.access(destDir, (err) => {
  if(err)
    fs.mkdirSync(destDir);

  copyFile(src, path.join(destDir, filename));
});

function copyFile(src, dest) {

  let readStream = fs.createReadStream(src);

  readStream.once('error', (err) => {
    console.log(err);
    process.exit(1);
  });

  readStream.once('end', () => {
    console.log('done copying');
    process.exit(0);
  });

  readStream.pipe(fs.createWriteStream(dest));
}
