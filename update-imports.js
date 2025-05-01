const fs = require('fs');
const path = require('path');

// List of files to update
const filesToUpdate = [
  './subcategories.js',
  './Apps/utils/initializeSubcategories.js',
  './Apps/Screens/UserChats.jsx',
  './Apps/Screens/ProfileScreen.jsx',
  './Apps/Screens/ProductDetail.jsx',
  './Apps/Screens/MyProducts.jsx',
  './Apps/Screens/ItemList.jsx',
  './Apps/Screens/HomeScreen.jsx',
  './Apps/Screens/ChatScreen.jsx',
  './Apps/Screens/AddPostScreen.jsx',
  './Apps/Navigations/ProfileStackNav.jsx'
];

// Process each file
filesToUpdate.forEach(filePath => {
  const fullPath = path.resolve(__dirname, filePath);
  
  try {
    // Read file content
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace old import with new import
    content = content.replace(
      /import\s*{\s*app\s*}\s*from\s*['"](.*)firebaseConfig['"];?/,
      `import { app } from '$1firebaseConfig.js';`
    );
    
    // Write updated content back to file
    fs.writeFileSync(fullPath, content);
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
});

console.log('Import updates completed!');
