export const formatApiError = (error: any): string => {
  if (typeof error === 'string') return error;

  if (error.message && Array.isArray(error.message)) {
    return error.message.join('; ');
  }

  if (error.error) return error.error;

  if (typeof error.message === 'string') return error.message;

  return 'An unexpected error occurred';
};

export const handleApiError = async (response: Response): Promise<never> => {
  const errorData = await response.json();
  console.error('API error:', errorData);
  throw new Error(formatApiError(errorData));
};

export const logError = (context: string, error: any) => {
  console.error(`Error in ${context}:`, error);
  return formatApiError(error);
};
