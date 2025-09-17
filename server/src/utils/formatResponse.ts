export interface ResponseFormat {
  statusCode: number;
  message: string;
  data?: any;
  error?: string;
}

const formatResponse = (statusCode: number, message: string, data?: any, error: string | null = null): ResponseFormat => ({
  statusCode,
  message,
  ...(data && { data }),
  error,
});

export default formatResponse;
