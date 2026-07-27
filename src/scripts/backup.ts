import 'dotenv/config';
import { exec } from 'child_process';
import { createWriteStream, existsSync, rmSync } from 'fs';
import path from 'path';
import { ZipArchive } from 'archiver';
import { google } from 'googleapis';
import resendStrategy from '../notification/strategies/resend.strategy';

// Environment variables are now loaded via import 'dotenv/config'

const DUMP_DIR = path.join(process.cwd(), 'dump');
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const ZIP_PATH = path.join(process.cwd(), `backup-${TIMESTAMP}.zip`);

/**
 * Step 1: Run mongodump
 */
function dumpDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      return reject(new Error('MONGO_URI is not defined in environment variables.'));
    }

    console.log('Starting mongodump...');
    // If a local mongodump binary was downloaded (e.g., during Render build), use it. Otherwise, use global.
    const fs = require('fs');
    const isLocalDump = fs.existsSync('./mongodump');
    const mongodumpCmd = isLocalDump ? './mongodump' : 'mongodump';

    const command = `${mongodumpCmd} --uri="${mongoUri}" --out="${DUMP_DIR}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('mongodump error:', stderr);
        return reject(error);
      }
      console.log('mongodump completed successfully.');
      resolve();
    });
  });
}

/**
 * Step 2: Compress to .zip
 */
function zipDirectory(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('Zipping database dump...');
    const output = createWriteStream(ZIP_PATH);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Zip file created: ${archive.pointer()} total bytes`);
      resolve();
    });

    archive.on('error', (err) => {
      reject(err);
    });

    archive.pipe(output);
    archive.directory(DUMP_DIR, false);
    archive.finalize();
  });
}

/**
 * Step 3: Send Notification Email with Attachment
 */
async function sendNotification(status: 'success' | 'failure', details: string, attachmentPath?: string): Promise<void> {
  const recipient = process.env.BACKUP_NOTIFICATION_EMAIL;
  if (!recipient) {
    console.warn('BACKUP_NOTIFICATION_EMAIL is not defined. Skipping email notification.');
    return;
  }

  const subject = status === 'success'
    ? '✅ Database Backup Successful'
    : '❌ Database Backup Failed';

  const html = status === 'success'
    ? `<p>The database backup was completed successfully.</p><p>Please find the backup file attached.</p>`
    : `<p>The database backup failed.</p><p><strong>Error Details:</strong></p><pre>${details}</pre>`;

  const attachments = attachmentPath ? [{ filename: path.basename(attachmentPath), content: require('fs').readFileSync(attachmentPath) }] : undefined;

  try {
    await resendStrategy.sendEmail({
      to: recipient,
      subject,
      html,
      attachments,
    });
    console.log('Notification email sent.');
  } catch (error) {
    console.error('Failed to send notification email:', error);
  }
}

/**
 * Step 5: Clean Up Local Files
 */
function cleanUp() {
  console.log('Cleaning up local files...');
  try {
    if (existsSync(DUMP_DIR)) {
      rmSync(DUMP_DIR, { recursive: true, force: true });
    }
    if (existsSync(ZIP_PATH)) {
      rmSync(ZIP_PATH, { force: true });
    }
    console.log('Cleanup completed.');
  } catch (err) {
    console.error('Error during cleanup:', err);
  }
}

/**
 * Main Orchestration
 */
export async function runBackup() {
  try {
    console.log('--- Starting Automated Backup Process ---');
    await dumpDatabase();
    await zipDirectory();

    // Check backup size if a limit is configured
    const fs = require('fs');
    const stats = fs.statSync(ZIP_PATH);
    const fileSizeMB = stats.size / (1024 * 1024);
    const maxMbLimit = process.env.BACKUP_MAX_MB ? parseFloat(process.env.BACKUP_MAX_MB) : null;

    if (maxMbLimit && fileSizeMB > maxMbLimit) {
      throw new Error(`Backup size (${fileSizeMB.toFixed(2)} MB) exceeds the maximum allowed limit of ${maxMbLimit} MB.`);
    }

    await sendNotification('success', 'Backup completed.', ZIP_PATH);
  } catch (error: any) {
    console.error('Backup process failed:', error);
    await sendNotification('failure', error.message || error.toString());
  } finally {
    cleanUp();
    console.log('--- Backup Process Finished ---');
  }
}

// Execute the backup if run directly
if (require.main === module) {
  runBackup().then(() => {
    process.exit(0);
  });
}
