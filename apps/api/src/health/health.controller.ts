import { Controller, Get } from '@nestjs/common';
import { HealthService, HealthReport } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Get()
  check(): Promise<HealthReport> {
    return this.health.check();
  }
}
