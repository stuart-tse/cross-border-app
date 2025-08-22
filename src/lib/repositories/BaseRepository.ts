import { PrismaClient, Prisma } from '@prisma/client';
import { PerformanceLogger, StructuredLogger } from '../services/shared/LoggingService';

export interface PaginationOptions {
  page: number;
  limit: number;
  orderBy?: Record<string, 'asc' | 'desc'>;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  where?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
}

export abstract class BaseRepository<T, TCreate, TUpdate> {
  protected db: PrismaClient;
  protected modelName: string;
  
  constructor(db: PrismaClient, modelName: string) {
    this.db = db;
    this.modelName = modelName;
  }

  protected getModel() {
    return (this.db as any)[this.modelName];
  }

  protected logQuery(operation: string, duration: number, userId?: string) {
    StructuredLogger.logDatabaseQuery(operation, this.modelName, duration, userId);
  }

  async create(data: TCreate, userId?: string): Promise<T> {
    const perf = new PerformanceLogger(`${this.modelName}.create`);
    
    try {
      const result = await this.getModel().create({
        data
      });
      
      perf.end({ userId, operation: 'create' });
      this.logQuery('CREATE', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'create');
      throw error;
    }
  }

  async findById(id: string, options?: FilterOptions, userId?: string): Promise<T | null> {
    const perf = new PerformanceLogger(`${this.modelName}.findById`);
    
    try {
      const result = await this.getModel().findUnique({
        where: { id },
        include: options?.include,
        select: options?.select
      });
      
      perf.end({ userId, operation: 'findById', id });
      this.logQuery('READ', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'findById');
      throw error;
    }
  }

  async findMany(
    options?: FilterOptions & PaginationOptions, 
    userId?: string
  ): Promise<PaginatedResult<T>> {
    const perf = new PerformanceLogger(`${this.modelName}.findMany`);
    
    try {
      const { page = 1, limit = 10, orderBy, where, include, select } = options || {};
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this.getModel().findMany({
          where,
          include,
          select,
          skip,
          take: limit,
          orderBy: orderBy || { createdAt: 'desc' }
        }),
        this.getModel().count({ where })
      ]);

      const totalPages = Math.ceil(total / limit);
      
      perf.end({ 
        userId, 
        operation: 'findMany', 
        page, 
        limit, 
        total,
        resultCount: data.length 
      });
      this.logQuery('READ', perf.end(), userId);

      return {
        data,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      this.handlePrismaError(error, 'findMany');
      throw error;
    }
  }

  async findFirst(options?: FilterOptions, userId?: string): Promise<T | null> {
    const perf = new PerformanceLogger(`${this.modelName}.findFirst`);
    
    try {
      const result = await this.getModel().findFirst({
        where: options?.where,
        include: options?.include,
        select: options?.select
      });
      
      perf.end({ userId, operation: 'findFirst' });
      this.logQuery('READ', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'findFirst');
      throw error;
    }
  }

  async update(id: string, data: Partial<TUpdate>, userId?: string): Promise<T> {
    const perf = new PerformanceLogger(`${this.modelName}.update`);
    
    try {
      const result = await this.getModel().update({
        where: { id },
        data
      });
      
      perf.end({ userId, operation: 'update', id });
      this.logQuery('UPDATE', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'update');
      throw error;
    }
  }

  async updateMany(
    where: Record<string, any>, 
    data: Partial<TUpdate>, 
    userId?: string
  ): Promise<{ count: number }> {
    const perf = new PerformanceLogger(`${this.modelName}.updateMany`);
    
    try {
      const result = await this.getModel().updateMany({
        where,
        data
      });
      
      perf.end({ userId, operation: 'updateMany', count: result.count });
      this.logQuery('UPDATE', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'updateMany');
      throw error;
    }
  }

  async delete(id: string, userId?: string): Promise<T> {
    const perf = new PerformanceLogger(`${this.modelName}.delete`);
    
    try {
      const result = await this.getModel().delete({
        where: { id }
      });
      
      perf.end({ userId, operation: 'delete', id });
      this.logQuery('DELETE', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'delete');
      throw error;
    }
  }

  async deleteMany(where: Record<string, any>, userId?: string): Promise<{ count: number }> {
    const perf = new PerformanceLogger(`${this.modelName}.deleteMany`);
    
    try {
      const result = await this.getModel().deleteMany({
        where
      });
      
      perf.end({ userId, operation: 'deleteMany', count: result.count });
      this.logQuery('DELETE', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'deleteMany');
      throw error;
    }
  }

  async count(where?: Record<string, any>, userId?: string): Promise<number> {
    const perf = new PerformanceLogger(`${this.modelName}.count`);
    
    try {
      const result = await this.getModel().count({ where });
      
      perf.end({ userId, operation: 'count', result });
      this.logQuery('COUNT', perf.end(), userId);
      
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'count');
      throw error;
    }
  }

  async exists(where: Record<string, any>, userId?: string): Promise<boolean> {
    const perf = new PerformanceLogger(`${this.modelName}.exists`);
    
    try {
      const result = await this.getModel().findFirst({
        where,
        select: { id: true }
      });
      
      const exists = !!result;
      perf.end({ userId, operation: 'exists', exists });
      this.logQuery('EXISTS', perf.end(), userId);
      
      return exists;
    } catch (error) {
      this.handlePrismaError(error, 'exists');
      throw error;
    }
  }

  async transaction<R>(
    operations: (tx: Prisma.TransactionClient) => Promise<R>
  ): Promise<R> {
    const perf = new PerformanceLogger(`${this.modelName}.transaction`);
    
    try {
      const result = await this.db.$transaction(operations);
      perf.end({ operation: 'transaction' });
      this.logQuery('TRANSACTION', perf.end());
      return result;
    } catch (error) {
      this.handlePrismaError(error, 'transaction');
      throw error;
    }
  }

  protected handlePrismaError(error: any, operation: string) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      StructuredLogger.logError(error, `${this.modelName}.${operation}`, {
        code: error.code,
        meta: error.meta
      });
      
      switch (error.code) {
        case 'P2002':
          throw new RepositoryError(
            'Unique constraint violation',
            'UNIQUE_CONSTRAINT_VIOLATION',
            this.modelName,
            operation
          );
        case 'P2025':
          throw new RepositoryError(
            'Record not found',
            'RECORD_NOT_FOUND',
            this.modelName,
            operation
          );
        case 'P2003':
          throw new RepositoryError(
            'Foreign key constraint violation',
            'FOREIGN_KEY_CONSTRAINT_VIOLATION',
            this.modelName,
            operation
          );
        default:
          throw new RepositoryError(
            error.message,
            'DATABASE_ERROR',
            this.modelName,
            operation
          );
      }
    }

    if (error instanceof Prisma.PrismaClientValidationError) {
      throw new RepositoryError(
        'Validation error',
        'VALIDATION_ERROR',
        this.modelName,
        operation
      );
    }

    StructuredLogger.logError(error, `${this.modelName}.${operation}`);
  }
}

export class RepositoryError extends Error {
  public readonly code: string;
  public readonly model: string;
  public readonly operation: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string, model: string, operation: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
    this.model = model;
    this.operation = operation;
    this.timestamp = new Date();
  }
}