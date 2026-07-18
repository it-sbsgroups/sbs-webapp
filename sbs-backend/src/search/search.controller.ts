import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { QuerySearchDto } from './dto/query-search.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // Single public entry point for the global search bar:
  //   GET /api/search?q=drill               -> mixed preview (products/news/brands)
  //   GET /api/search?q=drill&type=products  -> full paginated product results
  @Public()
  @Get()
  async search(@Query() query: QuerySearchDto) {
    return this.searchService.search(query);
  }
}
