export interface APIError {
  error?: string;
  message?: string;
  detail?: string | Record<string, any>;
}
