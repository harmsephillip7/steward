import { Controller, Get, Patch, Post, Param, Body, Res, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdvisorsService } from './advisors.service';
import { readFileSync, unlinkSync } from 'fs';

@ApiTags('advisors')
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Get('me')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current advisor profile' })
  getMe(@Request() req: any) {
    return this.advisorsService.getProfile(req.user.id);
  }

  @Patch('me/branding')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update advisor branding (logo, colours, firm name)' })
  updateBranding(@Request() req: any, @Body() body: any) {
    return this.advisorsService.updateBranding(req.user.id, body);
  }

  @Post('me/logo')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Upload firm logo — stored as base64 data URI in DB' })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (_req, file, cb) => {
      if (!file.mimetype.match(/^image\/(png|jpeg|jpg|gif|svg\+xml|webp)$/)) {
        cb(new Error('Only image files are allowed'), false);
      } else {
        cb(null, true);
      }
    },
  }))
  async uploadLogo(@Request() req: any, @UploadedFile() file: Express.Multer.File) {
    // Convert to base64 data URI and store in DB (survives Railway ephemeral FS)
    const base64 = file.buffer.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64}`;
    return this.advisorsService.updateBranding(req.user.id, { logo_url: dataUri });
  }
}
