// Clean time parser
function parseRelativeDate(relativeStr) {
  if (!relativeStr) return new Date().toISOString().split('T')[0];
  const now = new Date();
  const text = relativeStr.toLowerCase();
  
  const numberMatch = text.match(/(\d+)/);
  const val = numberMatch ? parseInt(numberMatch[1], 10) : 1;
  
  if (text.includes('day')) {
    now.setDate(now.getDate() - val);
  } else if (text.includes('week')) {
    now.setDate(now.getDate() - (val * 7));
  } else if (text.includes('month')) {
    now.setMonth(now.getMonth() - val);
  } else if (text.includes('year')) {
    now.setFullYear(now.getFullYear() - val);
  }
  
  return now.toISOString().split('T')[0];
}

function parseDateFromTitle(title, relativeDateText) {
  let cleanTitle = title.replace(/\s*([\/\.\-])\s*/g, '$1');
  
  // Format 1: DD/MM/YY or DD/MM/YYYY or DD.MM.YY or DD.MM.YYYY or DD-MM-YY or DD-MM-YYYY
  const dateRegex = /\b(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{2,4})\b/;
  const match = cleanTitle.match(dateRegex);
  if (match) {
    let day = parseInt(match[1], 10);
    let month = parseInt(match[2], 10);
    let year = parseInt(match[3], 10);
    
    if (year < 100) {
      year = 2000 + year;
    }
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }
    
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Format 1b: DD.MMYYYY (like 18.072024)
  const noSepRegex = /\b(\d{1,2})[\/\.\-](\d{1,2})(\d{4})\b/;
  const noSepMatch = cleanTitle.match(noSepRegex);
  if (noSepMatch) {
    let day = parseInt(noSepMatch[1], 10);
    let month = parseInt(noSepMatch[2], 10);
    let year = parseInt(noSepMatch[3], 10);
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  // Format 1c: DD MM YYYY or DD MM YY (spaces)
  const spaceRegex = /\b(\d{1,2})\s+(\d{1,2})\s+(\d{2,4})\b/;
  const spaceMatch = cleanTitle.match(spaceRegex);
  if (spaceMatch) {
    let day = parseInt(spaceMatch[1], 10);
    let month = parseInt(spaceMatch[2], 10);
    let year = parseInt(spaceMatch[3], 10);
    
    if (year < 100) {
      year = 2000 + year;
    }
    
    if (year > 2030) {
      if (String(year).endsWith('24')) year = 2024;
      else if (String(year).endsWith('25')) year = 2025;
      else if (String(year).endsWith('26')) year = 2026;
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 2000 && year <= 2030) {
      const pad = (num) => String(num).padStart(2, '0');
      return `${year}-${pad(month)}-${pad(day)}`;
    }
  }

  return parseRelativeDate(relativeDateText);
}

const titles = [
  "நான் இடைவிடாமல் ஆராதிக்கிற என் தேவன் By Bro. Ruskin Mid Week Service 29/08/2924",
  "08 08 2024",
  "பரம கானானை நோக்கி / “ Towards Promise Land” BRO.RUSKIN MIDWEEK SERVICE | WORSHIP | WORD | 18.072024",
  "துன்பத்திலும் தேவனை நேசித்தல் | SUNDAY CHURCH SERVICE | WORSHIP | WORD | BRO.DURAI |07 07 2024",
  "ஜீவ தண்ணீர் உள்ள நதிகள் By, Bro. Moses Worship Bro.Babu Mid week Service AGSTC         04 /07/ 2024",
  "ஆத்தும ஆதாயமே என் ஆத்தும தாகம்! Past. Premkumar Sunday 1st Service",
  "10th july f"
];

console.log("Testing Title Date Parsing Fixes:");
titles.forEach(t => {
  console.log(`Title: "${t}" -> Parsed Date: "${parseDateFromTitle(t, 'Today')}"`);
});
