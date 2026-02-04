import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { StorageService, LocalStorageService, R2StorageService } from './storage.service';
import { StorageController } from './storage.controller';

@Global()
@Module({
    controllers: [StorageController],
    providers: [
        {
            provide: StorageService,
            useFactory: (configService: ConfigService) => {
                const isProduction = configService.get('NODE_ENV') === 'production';
                if (isProduction) {
                    return new R2StorageService(configService);
                }
                return new LocalStorageService(configService);
            },
            inject: [ConfigService],
        },
    ],
    exports: [StorageService],
})
export class StorageModule { }
