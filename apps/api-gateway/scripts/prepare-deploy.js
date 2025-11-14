#!/usr/bin/env node
/**
 * Prepares a clean package.json for deployment
 * Removes workspace dependencies since they're bundled by webpack
 * Copies email templates to dist folder
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

// Copy email templates to dist folder
// When webpack bundles everything into main.js, __dirname will be 'dist/',
// so we need to copy templates to dist/templates/ (not dist/modules/email/templates/)
const templatesSourceDir = path.join(__dirname, '..', 'src', 'modules', 'email', 'templates');
const templatesDestDir = path.join(__dirname, '..', 'dist', 'templates');

// Create templates directory in dist if it doesn't exist
if (!fs.existsSync(templatesDestDir)) {
  fs.mkdirSync(templatesDestDir, { recursive: true });
}

// Copy all template files
const templateFiles = fs.readdirSync(templatesSourceDir);
templateFiles.forEach(file => {
  const sourcePath = path.join(templatesSourceDir, file);
  const destPath = path.join(templatesDestDir, file);

  if (fs.statSync(sourcePath).isFile()) {
    fs.copyFileSync(sourcePath, destPath);
    console.log(`✓ Copied email template: ${file}`);
  }
});

console.log(`✓ Copied ${templateFiles.length} email templates to dist folder`);
