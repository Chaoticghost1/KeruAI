import { Request, Response, NextFunction } from 'express';

/** Type-safe error message for catch (error: unknown) */
export function getErrorMessage(err: unknown, fallback = "Internal Server Error"): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return fallback;
}

export interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', {
    message: err.message,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    details: err.details
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: {
      message,
      statusCode,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
