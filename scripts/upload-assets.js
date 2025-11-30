const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config({ path: '.env.local' });

const PUBLIC_DIR = path.join(__dirname, '../public');

async function uploadDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await uploadDirectory(filePath);
    } else {
      const relativePath = path.relative(PUBLIC_DIR, filePath);
      // On ignore les fichiers cachés ou système
      if (file.startsWith('.')) continue;

      console.log(`Uploading ${relativePath}...`);
      
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const blob = await put(relativePath, fileBuffer, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN
        });
        console.log(`✅ Uploaded: ${blob.url}`);
      } catch (error) {
        console.error(`❌ Error uploading ${relativePath}:`, error.message);
      }
    }
  }
}

console.log('🚀 Starting upload to Vercel Blob...');
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('❌ BLOB_READ_WRITE_TOKEN is missing in .env.local');
  process.exit(1);
}

uploadDirectory(PUBLIC_DIR).then(() => {
  console.log('✨ All files uploaded!');
});
