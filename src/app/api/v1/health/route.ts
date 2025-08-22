import { NextRequest, NextResponse } from 'next/server';
import { getServices } from '@/lib/services/ServiceContainer';

export async function GET(req: NextRequest) {
  try {
    const services = getServices();
    
    // Perform health checks
    const healthStatus = await services.healthCheck();
    
    // Determine overall health
    const isHealthy = healthStatus.database && healthStatus.cache;
    const status = isHealthy ? 200 : 503;

    // Get additional system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      },
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development'
    };

    return NextResponse.json({
      success: isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        services: {
          database: {
            status: healthStatus.database ? 'connected' : 'disconnected',
            healthy: healthStatus.database
          },
          cache: {
            status: healthStatus.cache ? 'connected' : 'disconnected',
            healthy: healthStatus.cache
          }
        },
        system: systemInfo,
        timestamp: healthStatus.timestamp
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString()
      }
    }, { status });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      data: {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date()
      },
      meta: {
        version: 'v1',
        timestamp: new Date().toISOString()
      }
    }, { status: 503 });
  }
}