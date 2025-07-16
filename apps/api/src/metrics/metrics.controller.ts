import { Controller, Get } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

// Create metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'status'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
});

// Collect default metrics
collectDefaultMetrics();

@Controller('metrics')
export class MetricsController {
  @Get()
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  // Helper methods to increment metrics (can be used in interceptors)
  static incrementHttpRequests(method: string, status: string) {
    httpRequestsTotal.inc({ method, status });
  }

  static observeHttpDuration(method: string, route: string, duration: number) {
    httpRequestDuration.observe({ method, route }, duration);
  }
}
