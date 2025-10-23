import { Controller, Post, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@Controller('upload')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('logo')
  @UseInterceptors(FileInterceptor('file', new UploadService().getMulterConfig()))
  @ApiOperation({ summary: 'Upload brand logo' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Logo uploaded successfully' })
  async uploadLogo(@UploadedFile() file: Express.Multer.File) {
    return {
      filename: file.filename,
      url: this.uploadService.getFileUrl(file.filename),
      originalName: file.originalname,
      size: file.size,
    };
  }
}
