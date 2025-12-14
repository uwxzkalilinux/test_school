// Error handler utility
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error
    return error.response.data?.error || 'حدث خطأ في الخادم';
  } else if (error.request) {
    // Request made but no response
    return 'لا يمكن الاتصال بالخادم. يرجى التحقق من الاتصال بالإنترنت.';
  } else {
    // Something else happened
    return error.message || 'حدث خطأ غير متوقع';
  }
};

