const fs = require('fs');
const path = require('path');

const scratchDir = 'C:\\Users\\maria\\.gemini\\antigravity\\brain\\471ed86f-9ec5-4ea2-bf33-625856c13876\\scratch';

try {
  const files = ['youtube_response.html', 'live_response.html', 'playlist_response.html'];
  files.forEach(f => {
    const filePath = path.join(scratchDir, f);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const idx = content.indexOf('g0NJtcRG5sY');
      if (idx !== -1) {
        console.log(`Found in ${f} at index ${idx}!`);
        // Print 500 characters around the index
        console.log(content.substring(idx - 250, idx + 250));
      }
    }
  });
} catch (err) {
  console.error(err);
}
