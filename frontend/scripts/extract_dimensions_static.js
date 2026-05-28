// extract_dimensions_static.js - run with `node scripts/extract_dimensions_static.js`
// This script loads the built HTML file (dist/index.html) using Puppeteer and extracts
// dimensions for every element on the page. It generates a Markdown report with a
// single table (all elements) for the default viewport.

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(__dirname, '..');
const indexPath = path.join(projectRoot, 'dist', 'index.html');
const outputFile = path.join(projectRoot, 'design_dimensions_full.md');

async function extract() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('file://' + indexPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

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

  // Unique selectors only (first occurrence)
  const seen = new Set();
  const unique = elements.filter(e => {
    if (seen.has(e.selector)) return false;
    seen.add(e.selector);
    return true;
  });

  let md = '# UI Dimensions Report (Static Build)\n\nGenerated on ' + new Date().toISOString() + '\n\n';
  md += '| Selector | Width(px) | Height(px) | Margin (T,R,B,L) | Padding (T,R,B,L) |\n';
  md += '|---|---|---|---|---|\n';
  unique.forEach(e => {
    const margin = `${e.marginTop},${e.marginRight},${e.marginBottom},${e.marginLeft}`;
    const padding = `${e.paddingTop},${e.paddingRight},${e.paddingBottom},${e.paddingLeft}`;
    md += `| ${e.selector} | ${e.width} | ${e.height} | ${margin} | ${padding} |\n`;
  });

  fs.writeFileSync(outputFile, md, 'utf8');
  console.log('Dimensions written to', outputFile);
  await browser.close();
}

extract();
