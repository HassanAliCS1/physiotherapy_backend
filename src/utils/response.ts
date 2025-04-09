import { HTTP_MESSAGES, HTTP_STATUS } from "../constants/httpConstants";

interface Pagination {
  total: number;
  page: number;
  pageSize: number;
}

interface ApiResponse<T> {
  status: number;
  message: string;
  data?: T;
  pagination?: Pagination;
  error?: string | null;
}

interface SuccessResponseParams<T> {
  status?: number;
  message?: string;
  data?: T;
  pagination?: Pagination;
}

interface ErrorResponseParams {
  status: number;
  message: string;
  error?: string;
}

export const successResponse = <T>({
  status = HTTP_STATUS.OK,
  message = HTTP_MESSAGES.SUCCESS,
  data,
  pagination,
}: SuccessResponseParams<T>): ApiResponse<T> => ({
  status,
  message,
  data,
  pagination,
});

export const errorResponse = ({
  status,
  message,
  error,
}: ErrorResponseParams): ApiResponse<null> => ({
  status,
  message,
  error: error || null,
});
