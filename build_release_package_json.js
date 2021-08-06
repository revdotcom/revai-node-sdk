const fs = require('fs');
const path = require('path');

const origPackage = fs.readFileSync('package.json').toString();

try {
    const pkg = JSON.parse(origPackage);
    delete pkg.devDependencies;
    delete pkg.scripts;
    pkg.main = 'src/index.js';
    pkg.module = 'src/index.js';

    const buildPackage = JSON.stringify(pkg, null, 2);
    const root = __dirname;
    fs.writeFile(path.join(root, "dist", "package.json"), buildPackage, function() {
        console.log('Package JSON for publish rendered');
        process.exit(0);
    });
} catch (er) {
    console.error('package.json parse error: ', er);
    process.exit(1);
}
