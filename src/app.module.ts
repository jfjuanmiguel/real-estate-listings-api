import { Module } from '@nestjs/common';
import { CoreModule } from './core/core.module';
import { ListingModule } from './modules/listing/listing.module';

@Module({
  imports: [CoreModule, ListingModule],
  providers: [],
  controllers: [],
})
export class AppModule {}
