#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');

function checkPathsConfig() {
  console.log('\n=== Checking Paths Configuration ===');
  
  const pathsFile = path.join(projectRoot, 'src', 'config', 'paths.ts');
  const content = fs.readFileSync(pathsFile, 'utf8');
  
  if (content.includes('encodeURI')) {
    console.error('❌ ERROR: encodeURI found in paths.ts - will cause double encoding');
    process.exitCode = 1;
  } else {
    console.log('✅ paths.ts: No encodeURI usage detected');
  }
  
  if (!content.includes('BASE_PATH')) {
    console.error('❌ ERROR: BASE_PATH not found in paths.ts');
    process.exitCode = 1;
  } else {
    console.log('✅ paths.ts: BASE_PATH is defined');
  }
}

function checkSortingConfig() {
  console.log('\n=== Checking Sorting Configuration ===');
  
  const sortingFile = path.join(projectRoot, 'public', 'config', 'sorting.json');
  if (!fs.existsSync(sortingFile)) {
    console.warn('⚠️ sorting.json not found in public/config - using fallback only');
    return;
  }
  
  const content = fs.readFileSync(sortingFile, 'utf8');
  let config;
  try {
    config = JSON.parse(content);
  } catch {
    console.error('❌ ERROR: sorting.json is invalid JSON');
    process.exitCode = 1;
    return;
  }
  
  if (!config.workOrder || !Array.isArray(config.workOrder)) {
    console.error('❌ ERROR: sorting.json missing workOrder array');
    process.exitCode = 1;
  } else {
    console.log(`✅ sorting.json: workOrder has ${config.workOrder.length} items`);
  }
  
  if (config.mediaOrder && typeof config.mediaOrder !== 'object') {
    console.error('❌ ERROR: sorting.json mediaOrder is not an object');
    process.exitCode = 1;
  } else {
    const mediaCount = config.mediaOrder ? Object.keys(config.mediaOrder).length : 0;
    console.log(`✅ sorting.json: mediaOrder has ${mediaCount} works configured`);
  }
}

function checkMediaFiles() {
  console.log('\n=== Checking Media Files ===');
  
  const portfolioDir = path.join(projectRoot, 'public', '巧克力的作品集');
  if (!fs.existsSync(portfolioDir)) {
    console.error('❌ ERROR: 巧克力的作品集 directory not found');
    process.exitCode = 1;
    return;
  }
  
  const categories = fs.readdirSync(portfolioDir, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);
  
  console.log(`✅ Found ${categories.length} categories: ${categories.join(', ')}`);
  
  let totalFiles = 0;
  let videoCount = 0;
  let imageCount = 0;
  
  categories.forEach(category => {
    const catDir = path.join(portfolioDir, category);
    try {
      const files = fs.readdirSync(catDir, { recursive: true });
      files.forEach(file => {
        if (file.includes('.')) {
          totalFiles++;
          const ext = file.split('.').pop()?.toLowerCase();
          if (['mp4', 'webm', 'mov'].includes(ext || '')) videoCount++;
          else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) imageCount++;
        }
      });
    } catch (e) {
      console.warn(`⚠️ Cannot read category: ${category}`);
    }
  });
  
  console.log(`✅ Total media files: ${totalFiles}`);
  console.log(`✅ Video files: ${videoCount}`);
  console.log(`✅ Image files: ${imageCount}`);
}

function checkThumbnails() {
  console.log('\n=== Checking Thumbnails ===');
  
  const thumbnailsDir = path.join(projectRoot, 'public', 'thumbnails');
  if (!fs.existsSync(thumbnailsDir)) {
    console.warn('⚠️ thumbnails directory not found');
    return;
  }
  
  const thumbnails = fs.readdirSync(thumbnailsDir);
  console.log(`✅ Found ${thumbnails.length} thumbnail files`);
  
  const jpgCount = thumbnails.filter(f => f.endsWith('.jpg')).length;
  const pngCount = thumbnails.filter(f => f.endsWith('.png')).length;
  console.log(`✅ JPG thumbnails: ${jpgCount}`);
  console.log(`✅ PNG thumbnails: ${pngCount}`);
}

function checkBuildConfig() {
  console.log('\n=== Checking Build Configuration ===');
  
  const nextConfig = path.join(projectRoot, 'next.config.js');
  const content = fs.readFileSync(nextConfig, 'utf8');
  
  if (!content.includes('output: \'export\'')) {
    console.error('❌ ERROR: next.config.js missing output: export');
    process.exitCode = 1;
  } else {
    console.log('✅ next.config.js: Static export is enabled');
  }
  
  if (!content.includes('basePath')) {
    console.error('❌ ERROR: next.config.js missing basePath');
    process.exitCode = 1;
  } else {
    console.log('✅ next.config.js: basePath is configured');
  }
  
  if (!content.includes('unoptimized: true')) {
    console.warn('⚠️ next.config.js: images.unoptimized may not be set');
  } else {
    console.log('✅ next.config.js: images.unoptimized is enabled');
  }
}

function main() {
  console.log('🎯 Media Loading Verification Script');
  console.log('====================================');
  
  checkPathsConfig();
  checkSortingConfig();
  checkMediaFiles();
  checkThumbnails();
  checkBuildConfig();
  
  console.log('\n====================================');
  if (process.exitCode === 1) {
    console.log('❌ Verification FAILED - issues detected');
  } else {
    console.log('✅ Verification PASSED - all checks passed');
  }
}

main();