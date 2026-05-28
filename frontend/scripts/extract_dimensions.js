// extract_dimensions.js
const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Tailwind utility prefixes that affect dimensions
const dimensionPrefixes = [
  'w-', 'min-w-', 'max-w-',
  'h-', 'min-h-', 'max-h-',
  'p-', 'pt-', 'pr-', 'pb-', 'pl-', 'px-', 'py-',
  'm-', 'mt-', 'mr-', 'mb-', 'ml-', 'mx-', 'my-',
  'gap-', 'gap-x-', 'gap-y-'
];

function extractFromClass(className) {
  const results = [];
  for (const prefix of dimensionPrefixes) {
    if (className.startsWith(prefix)) {
      results.push(className);
    }
  }
  return results;
}

function parseJSXFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const classMatches = [...content.matchAll(/className\s*=\s*"([^"]*)"/g)];
  const styleMatches = [...content.matchAll(/style\s*=\s*\{([^}]+)\}/g)];
  const dims = [];
  for (const m of classMatches) {
    const classes = m[1].split(/\s+/);
    classes.forEach(cls => dims.push(...extractFromClass(cls)));
  }
  for (const m of styleMatches) {
    const styleStr = m[1];
    const width = styleStr.match(/width\s*:\s*['"]?([^,'"}]+)['"]?/);
    const height = styleStr.match(/height\s*:\s*['"]?([^,'"}]+)['"]?/);
    if (width) dims.push(`inline-width:${width[1]}`);
    if (height) dims.push(`inline-height:${height[1]}`);
  }
  return dims;
}

function parseCSSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const dims = [];
  const classRegex = /\.([A-Za-z0-9:-]+)\s*\{/g;
  let match;
  while ((match = classRegex.exec(content)) !== null) {
    const className = match[1];
    dims.push(...extractFromClass(className));
  }
  return dims;
}

function main() {
  const jsxFiles = glob.sync('src/**/*.jsx', { cwd: process.cwd() });
  const cssFiles = glob.sync('src/**/*.css', { cwd: process.cwd() });
  const allDims = {};

  jsxFiles.forEach(f => {
    const abs = path.resolve(f);
    const dims = parseJSXFile(abs);
    if (dims.length) allDims[abs] = dims;
  });
  cssFiles.forEach(f => {
    const abs = path.resolve(f);
    const dims = parseCSSFile(abs);
    if (dims.length) allDims[abs] = dims;
  });

  // Write markdown tables per file
  let md = '# UI Dimensions Report\n\n';
  const breakpoints = {
    default: 'Base',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  };
  md += '## Breakpoints\n\n| Name | Width |
|------|-------|
';
  for (const [k, v] of Object.entries(breakpoints)) {
    md += `| ${k} | ${v} |\n`;
  }
  md += '\n';

  for (const [file, dims] of Object.entries(allDims)) {
    md += `### ${file}\n\n`;
    md += '| Dimension Utility |\n|-------------------|\n';
    const unique = Array.from(new Set(dims)).sort();
    unique.forEach(d => md += `| ${d} |\n`);
    md += '\n';
  }
  fs.writeFileSync('design_dimensions.md', md);
  console.log('Dimensions extracted to design_dimensions.md');
}

main();
