import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards, Get, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 tentatives par minute max
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ status: 200, description: 'Connexion réussie avec access_token et refresh_token' })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  @ApiResponse({ status: 429, description: 'Trop de tentatives de connexion' })
  async login(@Body() loginDto: LoginDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginDto, ipAddress, userAgent);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouveler le access token avec le refresh token' })
  @ApiResponse({ status: 200, description: 'Token renouvelé avec succès' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  async refresh(@Body('refresh_token') refreshToken: string, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.refreshAccessToken(refreshToken, ipAddress, userAgent);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Déconnexion (révoque le refresh token)' })
  @ApiResponse({ status: 204, description: 'Déconnexion réussie' })
  async logout(@Body('refresh_token') refreshToken: string) {
    await this.authService.logout(refreshToken);
  }

  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Déconnexion de toutes les sessions' })
  @ApiResponse({ status: 204, description: 'Toutes les sessions ont été révoquées' })
  async logoutAll(@Req() req: any) {
    await this.authService.logoutAll(req.user.userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obtenir le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async getProfile(@Req() req: any) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Changer le mot de passe de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé avec succès' })
  @ApiResponse({ status: 401, description: 'Mot de passe actuel incorrect' })
  async changePassword(@Req() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    await this.authService.changePassword(req.user.userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }
}
