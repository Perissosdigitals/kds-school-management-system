import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { pipeline } from 'stream/promises';
import { BackupOptionsDto } from '../dto/backup-options.dto';

const execAsync = promisify(exec);

export interface BackupInfo {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  size: number;
  compressed: boolean;
  status: 'pending' | 'completed' | 'failed';
  filePath: string;
}

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupDir = path.join(process.cwd(), 'backups');
  private backups: Map<string, BackupInfo> = new Map();

  constructor() {
    // Créer le répertoire de backup s'il n'existe pas
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }

    // Charger les backups existants
    this.loadExistingBackups();
  }

  private loadExistingBackups() {
    try {
      if (fs.existsSync(this.backupDir)) {
        const files = fs.readdirSync(this.backupDir);
        files.forEach(file => {
          if (file.endsWith('.sql') || file.endsWith('.sql.gz')) {
            const filePath = path.join(this.backupDir, file);
            const stats = fs.statSync(filePath);
            const id = file.replace(/\.(sql|sql\.gz)$/, '');

            this.backups.set(id, {
              id,
              name: id,
              createdAt: stats.birthtime,
              size: stats.size,
              compressed: file.endsWith('.gz'),
              status: 'completed',
              filePath,
            });
          }
        });
        this.logger.log(`Loaded ${this.backups.size} existing backups`);
      }
    } catch (error) {
      this.logger.error('Error loading existing backups:', error);
    }
  }

  async createBackup(options: BackupOptionsDto): Promise<BackupInfo> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupId = `${options.name || 'backup'}_${timestamp}`;
    const fileName = options.compress ? `${backupId}.sql.gz` : `${backupId}.sql`;
    const filePath = path.join(this.backupDir, fileName);

    const backupInfo: BackupInfo = {
      id: backupId,
      name: options.name || backupId,
      createdAt: new Date(),
      size: 0,
      compressed: options.compress || false,
      status: 'pending',
      filePath,
    };

    this.backups.set(backupId, backupInfo);
    this.logger.log(`Starting backup: ${backupId}`);

    try {
      // Configuration PostgreSQL depuis les variables d'environnement
      const dbHost = process.env.DATABASE_HOST || 'localhost';
      const dbPort = process.env.DATABASE_PORT || '5432';
      const dbName = process.env.DATABASE_NAME || 'ksp_school_db';
      const dbUser = process.env.DATABASE_USER || 'ksp_admin';
      const dbPassword = process.env.DATABASE_PASSWORD || 'ksp_secure_password';

      // Commande pg_dump
      const pgDumpCommand = `PGPASSWORD="${dbPassword}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --no-owner --no-acl`;

      if (options.compress) {
        // Backup compressé
        const dumpProcess = exec(pgDumpCommand);
        const gzipStream = zlib.createGzip({ level: 9 });
        const writeStream = fs.createWriteStream(filePath);

        await pipeline(
          dumpProcess.stdout,
          gzipStream,
          writeStream
        );
      } else {
        // Backup non compressé
        await execAsync(`${pgDumpCommand} > ${filePath}`);
      }

      // Mettre à jour les informations du backup
      const stats = fs.statSync(filePath);
      backupInfo.size = stats.size;
      backupInfo.status = 'completed';
      this.backups.set(backupId, backupInfo);

      this.logger.log(`Backup completed: ${backupId} (${this.formatBytes(stats.size)})`);

      return backupInfo;
    } catch (error) {
      backupInfo.status = 'failed';
      this.backups.set(backupId, backupInfo);
      this.logger.error(`Backup failed: ${backupId}`, error);
      throw error;
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    return Array.from(this.backups.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getBackup(id: string): Promise<BackupInfo> {
    const backup = this.backups.get(id);
    if (!backup) {
      throw new NotFoundException(`Backup with ID ${id} not found`);
    }
    return backup;
  }

  async restoreBackup(id: string): Promise<void> {
    const backup = await this.getBackup(id);

    if (backup.status !== 'completed') {
      throw new Error('Cannot restore incomplete or failed backup');
    }

    if (!fs.existsSync(backup.filePath)) {
      throw new NotFoundException(`Backup file not found: ${backup.filePath}`);
    }

    this.logger.log(`Starting restore from backup: ${id}`);

    try {
      const dbHost = process.env.DATABASE_HOST || 'localhost';
      const dbPort = process.env.DATABASE_PORT || '5432';
      const dbName = process.env.DATABASE_NAME || 'ksp_school_db';
      const dbUser = process.env.DATABASE_USER || 'ksp_admin';
      const dbPassword = process.env.DATABASE_PASSWORD || 'ksp_secure_password';

      const psqlCommand = `PGPASSWORD="${dbPassword}" psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName}`;

      if (backup.compressed) {
        // Restaurer depuis backup compressé
        await execAsync(`gunzip -c ${backup.filePath} | ${psqlCommand}`);
      } else {
        // Restaurer depuis backup non compressé
        await execAsync(`${psqlCommand} < ${backup.filePath}`);
      }

      this.logger.log(`Restore completed from backup: ${id}`);
    } catch (error) {
      this.logger.error(`Restore failed from backup: ${id}`, error);
      throw error;
    }
  }

  async deleteBackup(id: string): Promise<void> {
    const backup = await this.getBackup(id);

    try {
      if (fs.existsSync(backup.filePath)) {
        fs.unlinkSync(backup.filePath);
      }
      this.backups.delete(id);
      this.logger.log(`Backup deleted: ${id}`);
    } catch (error) {
      this.logger.error(`Failed to delete backup: ${id}`, error);
      throw error;
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
