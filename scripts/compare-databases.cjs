#!/usr/bin/env node

/**
 * Database Schema Comparison Tool
 * Compares PostgreSQL (local via Docker) and Cloudflare D1 (Remote) schemas
 * 
 * Usage: node scripts/compare-databases.cjs
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

async function getPostgreSQLTables() {
    try {
        const { stdout } = await execAsync(`docker exec -i kds-postgres psql -U kds_admin -d kds_school_db -t -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"`);
        return stdout.trim().split('\n').map(t => t.trim()).filter(Boolean);
    } catch (error) {
        console.error(`${COLORS.red}Error fetching PostgreSQL tables:${COLORS.reset}`, error.message);
        return [];
    }
}

async function getD1Tables() {
    try {
        const { stdout } = await execAsync(`npx wrangler d1 execute kds-school-db --config backend/wrangler.toml --remote --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"`);

        // Parse wrangler output (it includes extra formatting)
        const lines = stdout.split('\n');
        const tables = [];
        let inResults = false;

        for (const line of lines) {
            if (line.includes('name')) {
                inResults = true;
                continue;
            }
            if (inResults && line.trim() && !line.includes('─') && !line.includes('│')) {
                const tableName = line.replace(/[│\s]/g, '').trim();
                if (tableName && tableName !== 'name') {
                    tables.push(tableName);
                }
            }
        }

        return tables.filter(t => !t.startsWith('sqlite_') && !t.startsWith('_'));
    } catch (error) {
        console.error(`${COLORS.red}Error fetching D1 tables:${COLORS.reset}`, error.message);
        return [];
    }
}

async function getTableColumns(tableName, database = 'postgresql') {
    try {
        if (database === 'postgresql') {
            const { stdout } = await execAsync(`docker exec -i kds-postgres psql -U kds_admin -d kds_school_db -t -c "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${tableName}' ORDER BY ordinal_position;"`);
            return stdout.trim().split('\n').map(line => {
                const [name, type] = line.trim().split('|').map(s => s.trim());
                return { name, type };
            }).filter(c => c.name);
        } else {
            const { stdout } = await execAsync(`npx wrangler d1 execute kds-school-db --config backend/wrangler.toml --remote --command="PRAGMA table_info(${tableName});"`);

            // Parse wrangler output
            const lines = stdout.split('\n');
            const columns = [];
            let inResults = false;

            for (const line of lines) {
                if (line.includes('name') && line.includes('type')) {
                    inResults = true;
                    continue;
                }
                if (inResults && line.includes('│')) {
                    const parts = line.split('│').map(s => s.trim()).filter(Boolean);
                    if (parts.length >= 3) {
                        columns.push({ name: parts[1], type: parts[2] });
                    }
                }
            }

            return columns;
        }
    } catch (error) {
        console.error(`${COLORS.red}Error fetching columns for ${tableName}:${COLORS.reset}`, error.message);
        return [];
    }
}

function compareColumns(pgColumns, d1Columns) {
    const pgColNames = new Set(pgColumns.map(c => c.name));
    const d1ColNames = new Set(d1Columns.map(c => c.name));

    const inBoth = [...pgColNames].filter(name => d1ColNames.has(name));
    const onlyInPg = [...pgColNames].filter(name => !d1ColNames.has(name));
    const onlyInD1 = [...d1ColNames].filter(name => !pgColNames.has(name));

    return { inBoth, onlyInPg, onlyInD1 };
}

async function main() {
    console.log(`\n${COLORS.cyan}╔═══════════════════════════════════════════════════════════╗${COLORS.reset}`);
    console.log(`${COLORS.cyan}║   KSP School Management - Database Schema Comparison     ║${COLORS.reset}`);
    console.log(`${COLORS.cyan}╚═══════════════════════════════════════════════════════════╝${COLORS.reset}\n`);

    console.log(`${COLORS.blue}Fetching PostgreSQL tables (via Docker)...${COLORS.reset}`);
    const pgTables = await getPostgreSQLTables();
    console.log(`${COLORS.green}✓ Found ${pgTables.length} tables in PostgreSQL${COLORS.reset}\n`);

    console.log(`${COLORS.blue}Fetching Cloudflare D1 tables (Remote)...${COLORS.reset}`);
    const d1Tables = await getD1Tables();
    console.log(`${COLORS.green}✓ Found ${d1Tables.length} tables in D1${COLORS.reset}\n`);

    // Compare table lists
    const pgTableSet = new Set(pgTables);
    const d1TableSet = new Set(d1Tables);

    const tablesInBoth = pgTables.filter(t => d1TableSet.has(t));
    const tablesOnlyInPg = pgTables.filter(t => !d1TableSet.has(t));
    const tablesOnlyInD1 = d1Tables.filter(t => !pgTableSet.has(t));

    console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.cyan}TABLE COMPARISON${COLORS.reset}`);
    console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);

    console.log(`${COLORS.green}✓ Tables in BOTH environments (${tablesInBoth.length}):${COLORS.reset}`);
    tablesInBoth.forEach(t => console.log(`  - ${t}`));
    console.log();

    if (tablesOnlyInPg.length > 0) {
        console.log(`${COLORS.yellow}⚠ Tables ONLY in PostgreSQL (${tablesOnlyInPg.length}):${COLORS.reset}`);
        tablesOnlyInPg.forEach(t => console.log(`  - ${t}`));
        console.log();
    }

    if (tablesOnlyInD1.length > 0) {
        console.log(`${COLORS.yellow}⚠ Tables ONLY in D1 (${tablesOnlyInD1.length}):${COLORS.reset}`);
        tablesOnlyInD1.forEach(t => console.log(`  - ${t}`));
        console.log();
    }

    // Detailed column comparison for common tables
    if (tablesInBoth.length > 0) {
        console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}`);
        console.log(`${COLORS.cyan}DETAILED COLUMN COMPARISON${COLORS.reset}`);
        console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);

        for (const tableName of tablesInBoth.slice(0, 5)) { // Limit to first 5 tables
            console.log(`${COLORS.blue}Table: ${tableName}${COLORS.reset}`);

            const pgColumns = await getTableColumns(tableName, 'postgresql');
            const d1Columns = await getTableColumns(tableName, 'd1');

            const { inBoth, onlyInPg, onlyInD1 } = compareColumns(pgColumns, d1Columns);

            console.log(`  ${COLORS.green}✓ Columns in both: ${inBoth.length}${COLORS.reset}`);
            if (onlyInPg.length > 0) {
                console.log(`  ${COLORS.yellow}⚠ Only in PostgreSQL: ${onlyInPg.join(', ')}${COLORS.reset}`);
            }
            if (onlyInD1.length > 0) {
                console.log(`  ${COLORS.yellow}⚠ Only in D1: ${onlyInD1.join(', ')}${COLORS.reset}`);
            }
            console.log();
        }
    }

    // Summary
    console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.cyan}SUMMARY${COLORS.reset}`);
    console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════${COLORS.reset}\n`);

    const totalRelevantTables = Math.max(pgTables.length, d1Tables.length);
    const compatibility = totalRelevantTables > 0 ? (tablesInBoth.length / totalRelevantTables * 100) : 0;

    console.log(`  Schema Compatibility: ${compatibility.toFixed(1)}%`);
    console.log(`  Tables in PostgreSQL: ${pgTables.length}`);
    console.log(`  Tables in D1: ${d1Tables.length}`);
    console.log(`  Tables in both: ${tablesInBoth.length}`);
    console.log(`  Tables needing migration: ${tablesOnlyInPg.length}`);

    if (tablesOnlyInPg.length > 0) {
        console.log(`\n${COLORS.yellow}⚠ Action Required:${COLORS.reset}`);
        console.log(`  ${tablesOnlyInPg.length} table(s) need to be migrated to D1:`);
        tablesOnlyInPg.forEach(t => console.log(`    - ${t}`));
    }

    console.log(`\n${COLORS.green}✓ Comparison complete!${COLORS.reset}\n`);
}

main().catch(error => {
    console.error(`${COLORS.red}Fatal error:${COLORS.reset}`, error);
    process.exit(1);
});
