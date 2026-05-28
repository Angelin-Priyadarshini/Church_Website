// extract_dimensions_puppeteer.js - run with `node scripts/extract_dimensions_puppeteer.js`
// This script launches a Vite dev server, opens each route defined in src/pages using Puppeteer,
// and extracts the bounding box dimensions (width, height, margin, padding) for every element on the page.
// It then writes a comprehensive Markdown report with tables per page and per viewport.

import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

// Define __dirname for ES module context
const __dirname = path.dirname(new URL(import.meta.url).pathname);


// Project root (frontend folder)
const projectRoot = path.resolve(__dirname, '..');
const pagesDir = path.join(projectRoot, 'src', 'pages');
const outputFile = path.join(projectRoot, 'design_dimensions_full.md');

// Viewport configurations (default + common breakpoints)
const viewports = [
  { name: 'default', width: 1440, height: 900 },
  { name: 'xl', width: 1280, height: 800 },
  { name: 'lg', width: 1024, height: 768 },
  { name: 'md', width: 768, height: 660 },
  { name: 'sm', width: 480, height: 640 }
];

function getRoutes() {
  const files = fs.readdirSync(pagesDir);
  const routes = [];
  files.forEach(file => {
    if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const name = path.basename(file, path.extname(file));
      if (name.toLowerCase() === 'home' || name.toLowerCase() === 'index') {
        routes.push('/');
      } else {
        routes.push('/' + name.toLowerCase());
      }
    }
  });
  return routes;
}

function startVite() {
  // Start Vite dev server in background using npx
  const dev = spawn('npm', ['run', 'dev'], { cwd: projectRoot, stdio: 'ignore', detached: true, shell: true });
  // Wait a few seconds for server to be ready
  return new Promise(resolve => setTimeout(() => resolve(dev), 5000));
}

async function extract() {
  const routes = getRoutes();
  const browser = await puppeteer.launch({ headless: true });
  let markdown = `# UI Dimensions Report (Full)\n\nGenerated on ${new Date().toISOString()}\n\n`;

  for (const vp of viewports) {
    markdown += `## Viewport: ${vp.name} (${vp.width}×${vp.height})\n\n`;
    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewport({ width: vp.width, height: vp.height });
      const url = `http://localhost:5173${route}`;
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      } catch (e) {
        // If navigation fails, skip this route
        await page.close();
        continue;
      }

      const elements = await page.evaluate(() => {
        const all = Array.from(document.querySelectorAll('*'));
        return all.map(el => {
          const rect = el.getBoundingClientRect();
          const style = window.getComputedStyle(el);
          const selector = el.tagName.toLowerCase() +
            (el.id ? `#${el.id}` : '') +
            (el.className ? `.${el.className.split(/\s+/).join('.')}` : '');
          return {
            selector,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            marginTop: Math.round(parseFloat(style.marginTop)),
            marginRight: Math.round(parseFloat(style.marginRight)),
            marginBottom: Math.round(parseFloat(style.marginBottom)),
            marginLeft: Math.round(parseFloat(style.marginLeft)),
            paddingTop: Math.round(parseFloat(style.paddingTop)),
            paddingRight: Math.round(parseFloat(style.paddingRight)),
            paddingBottom: Math.round(parseFloat(style.paddingBottom)),
            paddingLeft: Math.round(parseFloat(style.paddingLeft))
          };
        });
      });

      // Filter unique selectors (first occurrence only)
      const seen = new Set();
      const unique = elements.filter(e => {
        if (seen.has(e.selector)) return false;
        seen.add(e.selector);
        return true;
      });

      markdown += `### Page: ${route}\n\n`;
      markdown += `| Selector | Width(px) | Height(px) | Margin (T,R,B,L) | Padding (T,R,B,L) |\n`;
      markdown += `|---|---|---|---|---|\n`;
      unique.forEach(e => {
        const margin = `${e.marginTop},${e.marginRight},${e.marginBottom},${e.marginLeft}`;
        const padding = `${e.paddingTop},${e.paddingRight},${e.paddingBottom},${e.paddingLeft}`;
        markdown += `| ${e.selector} | ${e.width} | ${e.height} | ${margin} | ${padding} |\n`;
      });
      markdown += '\n';
      await page.close();
    }
  }
  await browser.close();
  fs.writeFileSync(outputFile, markdown, 'utf8');
  console.log('Full dimensions report written to', outputFile);
}

(async () => {
  console.log('Starting Vite dev server...');
  const devProc = await startVite();
  try {
    await extract();
  } finally {
    // Kill the Vite dev server process group
    try { process.kill(-devProc.pid); } catch (_) {}
  }
})();
