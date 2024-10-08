import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { UploadListingImageDto } from '../dto/upload-listing-image.dto';
import { LISTING_QUEUE } from '../../../core/queue/queue.constants';
import { BaseConsumer } from '../../../core/queue/base.consumer';
import { LoggerService } from '../../../core/logger/logger.service';
import { FileService } from '../../../utilities/file/file.service';
import { CloudinaryService } from '../../../utilities/cloudinary/cloudinary.service';
import { DatabaseService } from '../../../database/database.service';

@Processor(LISTING_QUEUE)
export class ListingConsumer extends BaseConsumer {
  constructor(
    logger: LoggerService,
    private readonly fileService: FileService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly databaseService: DatabaseService,
  ) {
    super(logger);
  }

  @Process(`createListingImage`)
  async createListingImage(job: Job<UploadListingImageDto>) {
    const buffer = this.fileService.base64ToBuffer(job.data.base64File);
    const cloudinaryUrl = await this.cloudinaryService.uploadImage(
      buffer,
      'listings',
    );

    // Create a new ListingImage record
    await this.databaseService.listingImage.create({
      data: {
        url: cloudinaryUrl,
        listing: {
          connect: { id: job.data.listingId },
        },
      },
    });

    return cloudinaryUrl;
  }
}
