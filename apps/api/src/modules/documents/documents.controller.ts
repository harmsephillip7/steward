import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuid } from 'uuid';
import { Response } from 'express';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly docs: DocumentsService) {}

  @Get('files/:filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = join(uploadDir, safe);
    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }
    return res.sendFile(filePath);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() dto: CreateDocumentDto) {
    return this.docs.create(req.user.id, dto);
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: uploadDir,
      filename: (_req, file, cb) => {
        const uniqueName = `${uuid()}${extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    }),
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  }))
  async upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() meta: { name?: string; type?: string; category?: string; client_id?: string; description?: string },
  ) {
    const dto: any = {
      name: meta.name || file.originalname,
      type: meta.type || 'other',
      category: meta.category || 'client',
      file_url: `/documents/files/${file.filename}`,
      mime_type: file.mimetype,
      file_size: file.size,
      description: meta.description,
      client_id: meta.client_id || undefined,
    };
    if (!dto.client_id) delete dto.client_id;
    if (!dto.description) delete dto.description;
    return this.docs.create(req.user.id, dto);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req: any, @Query('client_id') clientId?: string, @Query('type') type?: string) {
    return this.docs.findAll(req.user.id, clientId, type);
  }

  @Get('stats')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getStats(@Request() req: any) {
    return this.docs.getStats(req.user.id);
  }

  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.docs.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateDocumentDto) {
    return this.docs.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    return this.docs.remove(id, req.user.id);
  }
}
