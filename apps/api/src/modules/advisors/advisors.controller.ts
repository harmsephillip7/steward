import { Controller, Get, Patch, Post, Param, Body, Res, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdvisorsService } from './advisors.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';

const uploadDir = join(process.cwd(), 'uploads', 'logos');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@ApiTags('advisors')
@Controller('advisors')
export class AdvisorsController {
  constructor(private readonly advisorsService: AdvisorsService) {}

  @Get('logos/:filename')
  @ApiOperation({ summary: 'Serve logo file (public)' })
  serveLogo(@Param('filename') filename: string, @Res() res: any) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(uploadDir, safe);
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Logo not found' });
    }
    return res.sendFile(filePath);
  }

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
  @ApiOperation({ summary: 'Upload firm logo for proposals/reports' })
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (_req, file, cb) => {
        const uniqueName = `${uuid()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
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
    const logoUrl = `/advisors/logos/${file.filename}`;
    return this.advisorsService.updateBranding(req.user.id, { logo_url: logoUrl });
  }
}
