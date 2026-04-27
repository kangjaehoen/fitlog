export const useRealApi = process.env.FITLOG_USE_REAL_API !== "false";
export const allowMockFallback =
  process.env.NODE_ENV !== "production" &&
  process.env.FITLOG_ALLOW_MOCK_FALLBACK !== "false";
