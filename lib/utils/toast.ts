// Simple client-side toast utility

// For client components
export const useToast = () => {
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    // You can implement a more sophisticated toast UI here if needed
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-lg text-white ${
      type === 'success' ? 'bg-green-500' :
      type === 'error' ? 'bg-red-500' :
      type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return { showToast };
};

// For server components
export const toast = {
  success: (message: string) => console.log(`[SUCCESS] ${message}`),
  error: (message: string) => console.error(`[ERROR] ${message}`),
  info: (message: string) => console.log(`[INFO] ${message}`),
  warning: (message: string) => console.warn(`[WARNING] ${message}`),
};
