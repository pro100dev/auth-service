import { Injectable } from '@nestjs/common';
import { performance } from 'perf_hooks';

@Injectable()
export class MetricsService {
  private startTime: number;
  private requestCount: number = 0;

  constructor() {
    this.startTime = performance.now();
  }

  incrementRequestCount() {
    this.requestCount++;
  }

  getMetrics() {
    const uptime = performance.now() - this.startTime;
    
    return {
      uptime: `${Math.floor(uptime / 1000)}s`,
      requests: this.requestCount,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };
  }
} 