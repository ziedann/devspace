const fs = require('fs');
const path = require('path');
const https = require('https');
const matter = require('gray-matter');

const postsDirectory = path.join(process.cwd(), 'posts');
const authorsDirectory = path.join(process.cwd(), 'public/images/authors');

// Ensure authors directory exists
if (!fs.existsSync(authorsDirectory)) {
  fs.mkdirSync(authorsDirectory, { recursive: true });
}

// Get all markdown files
const posts = fs.readdirSync(postsDirectory);

// Track unique author images to avoid duplicate downloads
const processedImages = new Set();

posts.forEach((filename) => {
  const filePath = path.join(postsDirectory, filename);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data } = matter(fileContents);
  
  if (data.author_image && data.author_image.startsWith('https://randomuser.me')) {
    const imageUrl = data.author_image;
    if (!processedImages.has(imageUrl)) {
      processedImages.add(imageUrl);
      
      // Generate local filename from the last part of the URL
      const localFileName = imageUrl.split('/').pop();
      const localPath = path.join(authorsDirectory, localFileName);
      
      // Download the image
      https.get(imageUrl, (response) => {
        const fileStream = fs.createWriteStream(localPath);
        response.pipe(fileStream);
        
        fileStream.on('finish', () => {
          console.log(`Downloaded: ${localFileName}`);
          fileStream.close();
        });
      }).on('error', (err) => {
        console.error(`Error downloading ${imageUrl}:`, err.message);
      });
      
      // Update the markdown file to use local path
      const newImagePath = `/images/authors/${localFileName}`;
      const updatedContent = fileContents.replace(
        `author_image: "${imageUrl}"`,
        `author_image: "${newImagePath}"`
      );
      
      fs.writeFileSync(filePath, updatedContent);
      console.log(`Updated ${filename} to use local image path`);
    }
  }
});