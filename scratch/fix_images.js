const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'frontend/src/pages/Home.js',
  'frontend/src/pages/Categories.js',
  'frontend/src/components/HeroSlider.js',
  'frontend/src/components/CategoryList.js',
  'frontend/src/components/AboutSection.js',
  'backend/seed.js'
];

let counter = 1;

filesToUpdate.forEach(file => {
  const fullPath = path.join('e:/furniture-store-api', file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace all images.unsplash.com links
    // The regex matches the base url and any query params
    const regex = /https:\/\/images\.unsplash\.com\/photo-[a-zA-Z0-9\-]+[^'"]*/g;

    content = content.replace(regex, (match) => {
      const seed = `furn${counter++}`;
      return `https://picsum.photos/seed/${seed}/800/600`;
    });

    fs.writeFileSync(fullPath, content);
    console.log(`Updated ${file}`);
  } else {
    console.log(`File not found: ${file}`);
  }
});
