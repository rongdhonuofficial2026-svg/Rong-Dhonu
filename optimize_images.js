const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const dir = path.join(__dirname, 'public', 'images', 'placeholders');

async function optimizeImages() {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));
  
  for (const file of files) {
    const inputPath = path.join(dir, file);
    const outputPath = path.join(dir, file.replace('.png', '.webp'));
    
    console.log(`Optimizing ${file}...`);
    
    await sharp(inputPath)
      .resize({ width: 1600, withoutEnlargement: true }) // reasonable max size
      .webp({ quality: 75 })
      .toFile(outputPath);
      
    console.log(`Saved ${outputPath}`);
    
    // Optionally delete original PNG to save space
    fs.unlinkSync(inputPath);
  }
  
  console.log('Done organizing all images!');
}

optimizeImages().catch(console.error);
