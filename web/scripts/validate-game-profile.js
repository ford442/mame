const fs = require('fs');
const path = require('path');

const GAMES_DIR = path.resolve(__dirname, '..', 'games');
const DEFAULT_MAME_ROOT = path.resolve(__dirname, '..', '..');

function assertString(value, name, pattern) {
  if (typeof value !== 'string' || value.length === 0 || (pattern && !pattern.test(value))) {
    throw new Error(`Invalid or missing ${name}`);
  }
}

function resolveInside(root, relativePath, name) {
  if (path.isAbsolute(relativePath)) {
    throw new Error(`${name} must be a relative path`);
  }
  if (relativePath.split(/[\\/]/).includes('..')) {
    throw new Error(`${name} must not contain parent directory references`);
  }
  root = path.resolve(root);
  const resolved = path.resolve(root, relativePath);
  const relative = path.relative(root, resolved);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
    throw new Error(`${name} must stay within the allowed root`);
  }
  return resolved;
}

function loadGameProfile(profileId, mameRoot = DEFAULT_MAME_ROOT) {
  assertString(profileId, 'profile ID', /^[a-z0-9_-]+$/);
  const profilePath = path.join(GAMES_DIR, `${profileId}.json`);
  if (!fs.existsSync(profilePath)) {
    throw new Error(`Game profile not found: ${profilePath}`);
  }

  let profile;
  try {
    profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  } catch (error) {
    throw new Error(`Invalid JSON in ${profilePath}: ${error.message}`);
  }

  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) {
    throw new Error('Profile must be a JSON object');
  }
  validateGameProfile(profile, profileId, mameRoot);
  return profile;
}

function validateGameProfile(profile, profileId, mameRoot = DEFAULT_MAME_ROOT) {
  assertString(profile.id, 'id', /^[a-z0-9_-]+$/);
  if (profile.id !== profileId) {
    throw new Error(`Profile id "${profile.id}" does not match "${profileId}"`);
  }
  assertString(profile.title, 'title');
  assertString(profile.driver, 'driver', /^[a-z0-9_-]+$/);

  if (!profile.rom || typeof profile.rom !== 'object') {
    throw new Error('Missing rom configuration');
  }
  assertString(profile.rom.file, 'rom.file', /^[a-zA-Z0-9._/-]+$/);
  assertString(profile.rom.embedPath, 'rom.embedPath', /^\/roms\/[a-zA-Z0-9._/-]+$/);
  if (profile.rom.embedPath.split('/').includes('..')) {
    throw new Error('rom.embedPath must not contain parent directory references');
  }
  const romRoot = path.join(path.resolve(mameRoot), 'roms');
  const romPath = resolveInside(romRoot, profile.rom.file, 'rom.file');
  if (!fs.existsSync(romPath) || !fs.statSync(romPath).isFile()) {
    throw new Error(`ROM file not found: ${romPath}`);
  }

  if (!profile.build || typeof profile.build !== 'object') {
    throw new Error('Missing build configuration');
  }
  assertString(profile.build.subtarget, 'build.subtarget', /^[a-z0-9_-]+$/);
  assertString(profile.build.outputJs, 'build.outputJs', /^[a-zA-Z0-9._-]+\.js$/);
  if (!Array.isArray(profile.build.sources) || profile.build.sources.length === 0) {
    throw new Error('build.sources must contain at least one source path');
  }

  const sourcePaths = profile.build.sources.map(source => {
    assertString(source, 'build source', /^[a-zA-Z0-9._/-]+$/);
    const sourcePath = resolveInside(mameRoot, source, 'build source');
    if (!fs.existsSync(sourcePath) || !fs.statSync(sourcePath).isFile()) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }
    return sourcePath;
  });
  const driverPattern = new RegExp(`\\bGAME\\s*\\(\\s*\\d{4}\\s*,\\s*${profile.driver}\\s*,`);
  if (!sourcePaths.some(sourcePath => driverPattern.test(fs.readFileSync(sourcePath, 'utf8')))) {
    throw new Error(`Driver "${profile.driver}" is not registered in the listed source files`);
  }

  if (!profile.ui || typeof profile.ui !== 'object') {
    throw new Error('Missing ui configuration');
  }
  assertString(profile.ui.aspectRatio, 'ui.aspectRatio', /^\d+:\d+$/);
  const [width, height] = profile.ui.aspectRatio.split(':').map(Number);
  if (!width || !height) {
    throw new Error('ui.aspectRatio dimensions must be greater than zero');
  }
  if (!Array.isArray(profile.ui.controls) || profile.ui.controls.length === 0) {
    throw new Error('ui.controls must contain at least one control');
  }
  profile.ui.controls.forEach((control, index) => {
    if (!control || typeof control !== 'object') {
      throw new Error(`Invalid ui.controls[${index}]`);
    }
    assertString(control.label, `ui.controls[${index}].label`);
    assertString(control.mameKey, `ui.controls[${index}].mameKey`);
    assertString(control.defaultKey, `ui.controls[${index}].defaultKey`);
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const profileId = args.find(arg => arg !== '--json') || 'gng';
  const rootArg = args.find((arg, index) => index > 0 && arg !== '--json');

  try {
    const profile = loadGameProfile(profileId, rootArg || DEFAULT_MAME_ROOT);
    if (args.includes('--json')) {
      process.stdout.write(`${JSON.stringify(profile)}\n`);
    } else {
      console.log(`Validated game profile "${profile.id}"`);
    }
  } catch (error) {
    console.error(`Game profile validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = { loadGameProfile, validateGameProfile };
