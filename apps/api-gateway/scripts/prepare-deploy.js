#!/usr/bin/env node
/**
 * Prepares a clean package.json for deployment
 * Removes workspace dependencies since they're bundled by webpack
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const deployPackageJsonPath = path.join(__dirname, '..', 'dist', 'package.json');

// Read original package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Remove workspace dependencies (they're bundled)
const workspacePackages = ['@microplanner/database', '@microplanner/config', '@microplanner/types'];
workspacePackages.forEach(pkg => {
  delete packageJson.dependencies[pkg];
});

// Update scripts for deployment
packageJson.scripts = {
  start: 'node main.js'
};

// Write to dist directory
fs.writeFileSync(deployPackageJsonPath, JSON.stringify(packageJson, null, 2));

console.log('✓ Created deployment package.json without workspace dependencies');
