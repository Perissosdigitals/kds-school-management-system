import { SetMetadata } from '@nestjs/common';

/**
 * Décorateur pour marquer une route comme publique (sans authentification)
 * Usage: @Public() au-dessus d'un endpoint
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
