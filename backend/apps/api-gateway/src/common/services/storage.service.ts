import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { join } from 'path';

export interface StorageOptions {
    contentType?: string;
    isPublic?: boolean;
}

export abstract class StorageService {
    abstract uploadFile(file: Buffer | Uint8Array, key: string, options?: StorageOptions): Promise<string>;
    abstract getFileUrl(key: string): Promise<string>;
    abstract deleteFile(key: string): Promise<void>;
    abstract getFile(key: string): Promise<{ data: Buffer; contentType: string }>;
}

@Injectable()
export class LocalStorageService extends StorageService {
    private readonly logger = new Logger(LocalStorageService.name);
    private readonly uploadDir: string;

    constructor(private configService: ConfigService) {
        super();
        this.uploadDir = this.configService.get<string>('UPLOAD_DIR', 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async uploadFile(file: Buffer | Uint8Array, key: string): Promise<string> {
        const filePath = join(this.uploadDir, key);
        const dir = path.dirname(filePath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, file);
        return `/api/v1/storage/${key}`;
    }

    async getFileUrl(key: string): Promise<string> {
        return `/api/v1/storage/${key}`;
    }

    async deleteFile(key: string): Promise<void> {
        const filePath = join(this.uploadDir, key);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    async getFile(key: string): Promise<{ data: Buffer; contentType: string }> {
        const filePath = join(this.uploadDir, key);
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }
        const data = fs.readFileSync(filePath);
        // Simple mime type detection could be added here
        return { data, contentType: 'application/octet-stream' };
    }
}

@Injectable()
export class R2StorageService extends StorageService {
    private readonly logger = new Logger(R2StorageService.name);
    private readonly bucket: any; // R2Bucket from Cloudflare environment

    constructor(private configService: ConfigService) {
        super();
        // In Cloudflare Workers, bindings are available on the 'env' object.
        // However, in this NestJS setup, we might need a way to inject the bucket.
        // For now, we assume it's globally available or injected via a custom provider.
        // We'll use a hack to get it from process.env if possible, but 
        // ideally it should come from the request context in the worker.
    }

    private getBucket(): any {
        // This is a placeholder for how we access R2Bucket in the worker environment
        // @ts-ignore
        return globalThis.DOCUMENTS;
    }

    async uploadFile(file: Buffer | Uint8Array, key: string, options?: StorageOptions): Promise<string> {
        const bucket = this.getBucket();
        if (!bucket) {
            this.logger.error('R2 Bucket [DOCUMENTS] not found in global scope');
            throw new Error('R2 Bucket not configured');
        }

        await bucket.put(key, file, {
            httpMetadata: { contentType: options?.contentType },
        });

        return `/api/v1/storage/${key}`;
    }

    async getFileUrl(key: string): Promise<string> {
        return `/api/v1/storage/${key}`;
    }

    async deleteFile(key: string): Promise<void> {
        const bucket = this.getBucket();
        if (bucket) {
            await bucket.delete(key);
        }
    }

    async getFile(key: string): Promise<{ data: Buffer; contentType: string }> {
        const bucket = this.getBucket();
        if (!bucket) throw new Error('R2 Bucket not configured');

        const object = await bucket.get(key);
        if (!object) throw new Error('File not found in R2');

        const arrayBuffer = await object.arrayBuffer();
        return {
            data: Buffer.from(arrayBuffer),
            contentType: object.httpMetadata?.contentType || 'application/octet-stream'
        };
    }
}
