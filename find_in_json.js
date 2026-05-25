const fs = require('fs');

if (fs.existsSync('youtubei_response.json')) {
  const content = fs.readFileSync('youtubei_response.json', 'utf8');
  const idx = content.indexOf('g0NJtcRG5sY');
  if (idx !== -1) {
    console.log('Found in youtubei_response.json!');
    console.log(content.substring(idx - 300, idx + 300));
  } else {
    console.log('Not found in youtubei_response.json');
  }
} else {
  console.log('youtubei_response.json does not exist');
}
