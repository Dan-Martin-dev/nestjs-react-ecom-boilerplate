import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health(): object {
    return { status: 'ok', uptime: process.uptime(), timestamp: Date.now() };
  }

  // Support legacy and API-versioned health checks
  @Get('api/v1/health')
  apiHealth(): object {
    return this.health();
  }
}
