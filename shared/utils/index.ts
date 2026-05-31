import { ApiResponse, PaginatedResponse, PaginationParams } from '../types';

export function success<T>(data: T, message = 'success'): ApiResponse<T> {
  return { code: 0, message, data };
}

export function error(message: string, code = -1): ApiResponse<null> {
  return { code, message, data: null };
}

export function paginate<T>(
  list: T[],
  total: number,
  params: PaginationParams
): ApiResponse<PaginatedResponse<T>> {
  return success({
    list,
    total,
    page: params.page,
    pageSize: params.pageSize,
  });
}

export function generateOrderNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD${date}${random}`;
}

export function generateRefundNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `REF${date}${random}`;
}
