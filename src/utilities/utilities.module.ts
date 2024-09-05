import { Module } from '@nestjs/common';
import { FileService } from './file/file.service';
import { CloudinaryService } from './cloudinary/cloudinary.service';

@Module({
  providers: [FileService, CloudinaryService],
  exports: [FileService, CloudinaryService],
})
export class UtilitiesModule {}
