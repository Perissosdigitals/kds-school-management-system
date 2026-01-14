#!/usr/bin/env node

/**
 * Version Update Tool
 * Updates version.json with new version information
 * 
 * Usage: node scripts/update-version.js [environment] [version] [changes...]
 * Example: node scripts/update-version.js local 1.3.0 "Added parent portal"
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

const VERSION_FILE = path.join(__dirname, '..', 'version.json');

function loadVersionFile() {
    try {
        const content = fs.readFileSync(VERSION_FILE, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error(`${COLORS.red}Error loading version.json:${COLORS.reset}`, error.message);
        process.exit(1);
    }
}

function saveVersionFile(data) {
    try {
        fs.writeFileSync(VERSION_FILE, JSON.stringify(data, null, 2) + '\n', 'utf8');
        console.log(`${COLORS.green}✓ version.json updated successfully${COLORS.reset}`);
    } catch (error) {
        console.error(`${COLORS.red}Error saving version.json:${COLORS.reset}`, error.message);
        process.exit(1);
    }
}

function updateVersion(environment, newVersion, changes) {
    const data = loadVersionFile();

    if (!['local', 'cloudflare', 'both'].includes(environment)) {
        console.error(`${COLORS.red}Error: Invalid environment. Use 'local', 'cloudflare', or 'both'${COLORS.reset}`);
        process.exit(1);
    }

    const timestamp = new Date().toISOString();

    if (environment === 'both' || environment === 'local') {
        data.environments.local.version = `${newVersion}-local`;
        data.environments.local.lastUpdated = timestamp;

        console.log(`${COLORS.green}✓ Updated local version to ${newVersion}-local${COLORS.reset}`);
    }

    if (environment === 'both' || environment === 'cloudflare') {
        data.environments.cloudflare.version = `${newVersion}-cloudflare`;
        data.environments.cloudflare.lastDeployed = timestamp;

        console.log(`${COLORS.green}✓ Updated Cloudflare version to ${newVersion}-cloudflare${COLORS.reset}`);
    }

    // Update current version
    data.currentVersion = newVersion;
    data.lastUpdated = timestamp;

    // Add to releases
    const release = {
        version: environment === 'both' ? newVersion : `${newVersion}-${environment}`,
        date: timestamp.split('T')[0],
        environment: environment,
        type: determineReleaseType(newVersion),
        changes: changes || []
    };

    if (!data.releases) {
        data.releases = [];
    }
    data.releases.unshift(release);

    saveVersionFile(data);

    console.log(`\n${COLORS.cyan}Release Summary:${COLORS.reset}`);
    console.log(`  Version: ${release.version}`);
    console.log(`  Environment: ${release.environment}`);
    console.log(`  Type: ${release.type}`);
    console.log(`  Date: ${release.date}`);
    if (changes && changes.length > 0) {
        console.log(`  Changes:`);
        changes.forEach(change => console.log(`    - ${change}`));
    }
}

function determineReleaseType(version) {
    const [major, minor, patch] = version.split('.').map(Number);

    if (major > 0 && minor === 0 && patch === 0) {
        return 'major';
    } else if (minor > 0 && patch === 0) {
        return 'minor';
    } else {
        return 'patch';
    }
}

function showCurrentVersions() {
    const data = loadVersionFile();

    console.log(`\n${COLORS.cyan}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}║         KSP School Management - Current Versions          ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    console.log(`${COLORS.blue}Current Version:${COLORS.reset} ${data.currentVersion}`);
    console.log(`${COLORS.blue}Last Updated:${COLORS.reset} ${data.lastUpdated}\n`);

    console.log(`${COLORS.green}Local Environment:${COLORS.reset}`);
    console.log(`  Version: ${data.environments.local.version}`);
    console.log(`  Database: ${data.environments.local.database.type}`);
    console.log(`  Last Updated: ${data.environments.local.lastUpdated}`);
    console.log(`  Students: ${data.environments.local.dataStats.students}`);
    console.log(`  Teachers: ${data.environments.local.dataStats.teachers}`);
    console.log(`  Classes: ${data.environments.local.dataStats.classes}\n`);

    console.log(`${COLORS.yellow}Cloudflare Environment:${COLORS.reset}`);
    console.log(`  Version: ${data.environments.cloudflare.version}`);
    console.log(`  Database: ${data.environments.cloudflare.database.type}`);
    console.log(`  Last Deployed: ${data.environments.cloudflare.lastDeployed}`);
    console.log(`  Students: ${data.environments.cloudflare.dataStats.students}`);
    console.log(`  Teachers: ${data.environments.cloudflare.dataStats.teachers}`);
    console.log(`  Classes: ${data.environments.cloudflare.dataStats.classes}\n`);

    console.log(`${COLORS.cyan}Feature Parity:${COLORS.reset} ${data.featureParity.parityPercentage.toFixed(1)}%`);
    console.log(`  In both: ${data.featureParity.inBothEnvironments.length} features`);
    console.log(`  Local only: ${data.featureParity.localOnly.length} features`);

    if (data.featureParity.localOnly.length > 0) {
        console.log(`\n${COLORS.yellow}Features pending migration to Cloudflare:${COLORS.reset}`);
        data.featureParity.localOnly.forEach(f => console.log(`  - ${f}`));
    }

    console.log();
}

function showUsage() {
    console.log(`\n${COLORS.cyan}Usage:${COLORS.reset}`);
    console.log(`  node scripts/update-version.js [command] [options]\n`);
    console.log(`${COLORS.cyan}Commands:${COLORS.reset}`);
    console.log(`  show                                    Show current versions`);
    console.log(`  update <env> <version> [changes...]     Update version\n`);
    console.log(`${COLORS.cyan}Examples:${COLORS.reset}`);
    console.log(`  node scripts/update-version.js show`);
    console.log(`  node scripts/update-version.js update local 1.3.0 "Added parent portal"`);
    console.log(`  node scripts/update-version.js update cloudflare 1.5.0 "Deployed finances" "Added analytics"`);
    console.log(`  node scripts/update-version.js update both 2.0.0 "Major release"\n`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0 || args[0] === 'show') {
    showCurrentVersions();
} else if (args[0] === 'update') {
    if (args.length < 3) {
        console.error(`${COLORS.red}Error: Missing arguments${COLORS.reset}`);
        showUsage();
        process.exit(1);
    }

    const environment = args[1];
    const version = args[2];
    const changes = args.slice(3);

    updateVersion(environment, version, changes);
} else if (args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showUsage();
} else {
    console.error(`${COLORS.red}Error: Unknown command '${args[0]}'${COLORS.reset}`);
    showUsage();
    process.exit(1);
}
