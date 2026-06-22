// Lumina metro config. Bundles the dependency-free @lumina/shared package, which
// lives outside the app root (packages/shared), via watchFolders + an alias.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const sharedRoot = path.resolve(projectRoot, '../../packages/shared');

const config = getDefaultConfig(projectRoot);

// @lumina/shared is symlinked into node_modules (file: dep) but its source lives
// outside the app root, so Metro must watch it to bundle the files.
config.watchFolders = [sharedRoot];

module.exports = config;
