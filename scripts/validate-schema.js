#!/usr/bin/env node

/**
 * Schema Validation Script
 * 
 * This script validates that the TypeScript schema definitions in shared/schema.ts
 * are in sync with the SQL migrations in supabase/migrations.
 * 
 * It checks:
 * 1. All tables defined in SQL migrations exist in TypeScript schema
 * 2. All columns defined in SQL migrations exist in TypeScript schema
 * 3. Column types are compatible between SQL and TypeScript
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations');
const SCHEMA_TS_PATH = path.join(__dirname, '..', 'shared', 'schema.ts');

// Colors for console output
const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Log with color
function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

// Extract table definitions from SQL migrations
function extractTablesFromSQL() {
  const tables = {};
  
  // Read all SQL migration files
  const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Process in order
  
  for (const file of migrationFiles) {
    const filePath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    // Extract CREATE TABLE statements
    const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)\s*\(([\s\S]*?)(?:\);)/gi;
    let match;
    
    while ((match = createTableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const tableDefinition = match[2];
      
      if (!tables[tableName]) {
        tables[tableName] = { columns: {} };
      }
      
      // Extract column definitions
      const columnLines = tableDefinition.split(',').map(line => line.trim());
      
      for (const line of columnLines) {
        // Skip constraints and empty lines
        if (line.startsWith('PRIMARY KEY') || 
            line.startsWith('FOREIGN KEY') || 
            line.startsWith('CONSTRAINT') || 
            line.startsWith('UNIQUE') ||
            line === '') {
          continue;
        }
        
        // Extract column name and type
        const columnMatch = line.match(/^(\w+)\s+([\w\s\(\)]+)(?:\s+DEFAULT\s+.*)?(?:\s+NOT\s+NULL)?/i);
        if (columnMatch) {
          const columnName = columnMatch[1];
          const columnType = columnMatch[2].trim();
          tables[tableName].columns[columnName] = columnType;
        }
      }
    }
    
    // Extract ALTER TABLE statements to add columns
    const alterTableRegex = /ALTER\s+TABLE\s+(?:public\.)?(\w+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s+([\w\s\(\)]+)(?:\s+DEFAULT\s+.*)?(?:\s+NOT\s+NULL)?/gi;
    
    while ((match = alterTableRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const columnName = match[2];
      const columnType = match[3].trim();
      
      if (!tables[tableName]) {
        tables[tableName] = { columns: {} };
      }
      
      tables[tableName].columns[columnName] = columnType;
    }
  }
  
  return tables;
}

// Extract table definitions from TypeScript schema
function extractTablesFromTypeScript() {
  const schemaContent = fs.readFileSync(SCHEMA_TS_PATH, 'utf8');
  const tables = {};
  
  // Extract table definitions
  const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable\(\s*["'](\w+)["']/g;
  let match;
  
  while ((match = tableRegex.exec(schemaContent)) !== null) {
    const variableName = match[1];
    const tableName = match[2];
    
    tables[tableName] = { 
      variableName,
      columns: {}
    };
    
    // Find the table definition block
    const blockStartIndex = schemaContent.indexOf('{', match.index);
    let blockEndIndex = blockStartIndex;
    let braceCount = 1;
    
    for (let i = blockStartIndex + 1; i < schemaContent.length; i++) {
      if (schemaContent[i] === '{') braceCount++;
      if (schemaContent[i] === '}') braceCount--;
      
      if (braceCount === 0) {
        blockEndIndex = i;
        break;
      }
    }
    
    const tableBlock = schemaContent.substring(blockStartIndex, blockEndIndex);
    
    // Extract column definitions
    const columnRegex = /(\w+):\s*(\w+)\(["'](\w+)["']\)/g;
    let columnMatch;
    
    while ((columnMatch = columnRegex.exec(tableBlock)) !== null) {
      const columnName = columnMatch[1];
      const columnType = columnMatch[2];
      tables[tableName].columns[columnName] = columnType;
    }
  }
  
  return tables;
}

// Map SQL types to TypeScript types
function mapSQLTypeToTS(sqlType) {
  const typeMap = {
    'TEXT': 'text',
    'VARCHAR': 'text',
    'CHAR': 'text',
    'UUID': 'uuid',
    'INTEGER': 'integer',
    'INT': 'integer',
    'BIGINT': 'integer',
    'SMALLINT': 'integer',
    'BOOLEAN': 'boolean',
    'TIMESTAMP': 'timestamp',
    'TIMESTAMP WITH TIME ZONE': 'timestamp',
    'DATE': 'date',
    'TIME': 'time',
    'JSONB': 'jsonb',
    'JSON': 'json',
    'FLOAT': 'real',
    'REAL': 'real',
    'DOUBLE PRECISION': 'doublePrecision',
    'SERIAL': 'serial',
    'BIGSERIAL': 'bigserial',
  };
  
  // Extract base type from SQL type (e.g., VARCHAR(255) -> VARCHAR)
  const baseType = sqlType.split('(')[0].toUpperCase();
  
  return typeMap[baseType] || null;
}

// Compare SQL and TypeScript schemas
function compareSchemas() {
  const sqlTables = extractTablesFromSQL();
  const tsTables = extractTablesFromTypeScript();
  
  let errors = 0;
  let warnings = 0;
  
  log('\n=== Schema Validation Report ===', COLORS.cyan);
  
  // Check tables in SQL that are missing in TypeScript
  for (const tableName in sqlTables) {
    if (!tsTables[tableName]) {
      log(`ERROR: Table '${tableName}' exists in SQL but is missing in TypeScript schema`, COLORS.red);
      errors++;
      continue;
    }
    
    log(`Checking table: ${tableName}`, COLORS.blue);
    
    // Check columns in SQL that are missing in TypeScript
    for (const columnName in sqlTables[tableName].columns) {
      if (!tsTables[tableName].columns[columnName]) {
        log(`  ERROR: Column '${columnName}' of table '${tableName}' exists in SQL but is missing in TypeScript schema`, COLORS.red);
        errors++;
        continue;
      }
      
      // Check type compatibility
      const sqlType = sqlTables[tableName].columns[columnName];
      const tsType = tsTables[tableName].columns[columnName];
      const expectedTsType = mapSQLTypeToTS(sqlType);
      
      if (expectedTsType && tsType !== expectedTsType) {
        log(`  WARNING: Column '${columnName}' of table '${tableName}' has type '${tsType}' in TypeScript but expected '${expectedTsType}' based on SQL type '${sqlType}'`, COLORS.yellow);
        warnings++;
      }
    }
    
    // Check columns in TypeScript that are missing in SQL
    for (const columnName in tsTables[tableName].columns) {
      if (!sqlTables[tableName].columns[columnName]) {
        log(`  WARNING: Column '${columnName}' of table '${tableName}' exists in TypeScript schema but is missing in SQL migrations`, COLORS.yellow);
        warnings++;
      }
    }
  }
  
  // Check tables in TypeScript that are missing in SQL
  for (const tableName in tsTables) {
    if (!sqlTables[tableName]) {
      log(`WARNING: Table '${tableName}' exists in TypeScript schema but is missing in SQL migrations`, COLORS.yellow);
      warnings++;
    }
  }
  
  // Summary
  log('\n=== Summary ===', COLORS.cyan);
  log(`Tables in SQL: ${Object.keys(sqlTables).length}`, COLORS.blue);
  log(`Tables in TypeScript: ${Object.keys(tsTables).length}`, COLORS.blue);
  log(`Errors: ${errors}`, errors > 0 ? COLORS.red : COLORS.green);
  log(`Warnings: ${warnings}`, warnings > 0 ? COLORS.yellow : COLORS.green);
  
  if (errors > 0) {
    log('\nSchema validation failed. Please fix the errors above.', COLORS.red);
    process.exit(1);
  } else if (warnings > 0) {
    log('\nSchema validation completed with warnings. Please review the warnings above.', COLORS.yellow);
    process.exit(0);
  } else {
    log('\nSchema validation successful! SQL migrations and TypeScript schema are in sync.', COLORS.green);
    process.exit(0);
  }
}

// Run the validation
compareSchemas();
