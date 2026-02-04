import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { StorageService } from './storage.service';
import { Public } from '../decorators/public.decorator';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('storage')
@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Public()
    @Get(':path(*)')
    @ApiOperation({ summary: 'Serve files from storage' })
    async getFile(@Param('path') path: string, @Res() res: Response) {
        try {
            const { data, contentType } = await this.storageService.getFile(path);

            res.setHeader('Content-Type', contentType);
            res.setHeader('Content-Length', data.length);

            // Set headers for security and embedding
            res.removeHeader('X-Frame-Options');
            res.setHeader('Content-Security-Policy', "frame-ancestors 'self' http://localhost:5173 http://localhost:5174 http://localhost:5175; default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:;");
            res.setHeader('Access-Control-Allow-Origin', '*');

            return res.send(data);
        } catch (error) {
            console.error(`[StorageController] Error serving file: ${path}`, error.message);
            throw new NotFoundException('Fichier non trouvé');
        }
    }
}
