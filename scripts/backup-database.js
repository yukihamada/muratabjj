#!/usr/bin/env node

/**
 * Database backup script for Murata BJJ
 * Supports scheduled backups to S3 or local storage
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  backupDestination: process.env.BACKUP_DESTINATION || 'local', // 'local' or 's3'
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  localBackupPath: process.env.BACKUP_LOCAL_PATH || './backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS || '30'),
};

// Ensure backup directory exists
if (config.backupDestination === 'local' && !fs.existsSync(config.localBackupPath)) {
  fs.mkdirSync(config.localBackupPath, { recursive: true });
}

async function getSupabaseProjectRef() {
  const urlMatch = config.supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  return urlMatch ? urlMatch[1] : null;
}

async function performBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const projectRef = await getSupabaseProjectRef();
  
  if (!projectRef) {
    throw new Error('Could not extract project reference from Supabase URL');
  }

  console.log(`🔄 Starting backup for project: ${projectRef}`);
  console.log(`📅 Timestamp: ${timestamp}`);

  try {
    // Generate backup using Supabase CLI
    const backupFileName = `backup-${projectRef}-${timestamp}.sql`;
    const backupPath = path.join(config.localBackupPath, backupFileName);

    // Use pg_dump via Supabase connection string
    const connectionString = `postgresql://postgres.${projectRef}:${config.supabaseServiceKey}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;
    
    console.log('📦 Creating database dump...');
    await execAsync(`pg_dump "${connectionString}" --no-owner --no-privileges --exclude-schema=auth --exclude-schema=storage > "${backupPath}"`);
    
    // Compress the backup
    console.log('🗜️ Compressing backup...');
    await execAsync(`gzip "${backupPath}"`);
    const compressedPath = `${backupPath}.gz`;
    
    // Get file size
    const stats = fs.statSync(compressedPath);
    const fileSizeMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log(`✅ Backup created: ${path.basename(compressedPath)} (${fileSizeMB} MB)`);

    // Upload to S3 if configured
    if (config.backupDestination === 's3' && config.s3Bucket) {
      console.log('☁️ Uploading to S3...');
      const s3Key = `database-backups/${path.basename(compressedPath)}`;
      await execAsync(`aws s3 cp "${compressedPath}" "s3://${config.s3Bucket}/${s3Key}"`);
      console.log(`✅ Uploaded to S3: ${s3Key}`);
      
      // Remove local file after S3 upload
      fs.unlinkSync(compressedPath);
    }

    // Clean up old backups
    await cleanupOldBackups();

    console.log('🎉 Backup completed successfully!');
    return { success: true, fileName: compressedPath };

  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

async function cleanupOldBackups() {
  console.log('🧹 Cleaning up old backups...');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays);

  if (config.backupDestination === 'local') {
    // Clean local backups
    const files = fs.readdirSync(config.localBackupPath);
    let deletedCount = 0;

    for (const file of files) {
      if (file.startsWith('backup-') && file.endsWith('.gz')) {
        const filePath = path.join(config.localBackupPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      }
    }

    if (deletedCount > 0) {
      console.log(`🗑️ Deleted ${deletedCount} old backup(s)`);
    }
  } else if (config.backupDestination === 's3') {
    // Clean S3 backups
    try {
      const listCommand = `aws s3 ls s3://${config.s3Bucket}/database-backups/ --recursive`;
      const { stdout } = await execAsync(listCommand);
      const files = stdout.split('\n').filter(line => line.includes('backup-'));
      
      for (const file of files) {
        const parts = file.split(/\s+/);
        const dateStr = `${parts[0]} ${parts[1]}`;
        const fileDate = new Date(dateStr);
        const fileName = parts[3];
        
        if (fileDate < cutoffDate && fileName) {
          await execAsync(`aws s3 rm s3://${config.s3Bucket}/${fileName}`);
          console.log(`🗑️ Deleted old S3 backup: ${fileName}`);
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not clean S3 backups:', error.message);
    }
  }
}

// Restore function
async function restoreBackup(backupFile) {
  console.log(`🔄 Starting restore from: ${backupFile}`);
  
  const projectRef = await getSupabaseProjectRef();
  const connectionString = `postgresql://postgres.${projectRef}:${config.supabaseServiceKey}@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`;
  
  try {
    // Decompress if needed
    let sqlFile = backupFile;
    if (backupFile.endsWith('.gz')) {
      console.log('📦 Decompressing backup...');
      await execAsync(`gunzip -c "${backupFile}" > "${backupFile.replace('.gz', '')}"`);
      sqlFile = backupFile.replace('.gz', '');
    }
    
    console.log('💾 Restoring database...');
    await execAsync(`psql "${connectionString}" < "${sqlFile}"`);
    
    console.log('✅ Restore completed successfully!');
    
    // Clean up decompressed file
    if (backupFile.endsWith('.gz') && fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
    
  } catch (error) {
    console.error('❌ Restore failed:', error.message);
    throw error;
  }
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  if (command === 'restore' && args[1]) {
    restoreBackup(args[1]).catch(console.error);
  } else {
    performBackup().catch(console.error);
  }
}

module.exports = { performBackup, restoreBackup };