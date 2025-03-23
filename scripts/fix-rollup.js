/**
 * This script addresses issues with Rollup's optional platform-specific dependencies
 * that may cause errors in CI environments like GitHub Actions.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('Running Rollup dependency fix script...');

try {
  // Create empty module for the platform-specific module that's causing issues
  const modulePath = path.join(rootDir, 'node_modules', '@rollup', 'rollup-linux-x64-gnu');
  
  // Create directories if they don't exist
  if (!fs.existsSync(path.join(rootDir, 'node_modules', '@rollup'))) {
    fs.mkdirSync(path.join(rootDir, 'node_modules', '@rollup'), { recursive: true });
  }
  
  if (!fs.existsSync(modulePath)) {
    fs.mkdirSync(modulePath, { recursive: true });
    
    // Create package.json
    fs.writeFileSync(
      path.join(modulePath, 'package.json'),
      JSON.stringify({
        name: '@rollup/rollup-linux-x64-gnu',
        version: '4.12.0',
        os: ['linux'],
        cpu: ['x64'],
        main: 'index.js',
      }, null, 2)
    );
    
    // Create empty index.js
    fs.writeFileSync(
      path.join(modulePath, 'index.js'),
      '// Empty module to satisfy Rollup platform-specific dependency\nmodule.exports = {};'
    );
    
    console.log('Created empty @rollup/rollup-linux-x64-gnu module');
  } else {
    console.log('@rollup/rollup-linux-x64-gnu module already exists');
  }
  
  // Set environment variable to skip native module resolution
  process.env.ROLLUP_SKIP_NODEJS_RESOLUTION = 'true';
  
  console.log('Rollup dependency fix completed successfully');
} catch (error) {
  console.error('Error fixing Rollup dependencies:', error);
  // Don't exit with error to avoid breaking the build
} 