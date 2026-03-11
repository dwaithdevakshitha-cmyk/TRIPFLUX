const fs = require('fs');
const path = require('path');

async function check() {
    const data = JSON.parse(fs.readFileSync('tmp/exported_data.json'));
    const packages = data.packages || [];
    
    console.log(`Total packages: ${packages.length}`);
    
    const imagePaths = [...new Set(packages.map(p => p.image).filter(img => img && img.startsWith('/assets/images/')))];
    
    console.log('\nChecking local image files:');
    for (const imgPath of imagePaths) {
        // imgPath is like /assets/images/foo.jpg
        // local path is public/assets/images/foo.jpg
        const localPath = path.join('public', imgPath);
        if (fs.existsSync(localPath)) {
            console.log(`[OK] ${imgPath}`);
        } else {
            console.log(`[MISSING] ${imgPath} (Expected at ${localPath})`);
        }
    }
}

check();
