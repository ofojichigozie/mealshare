import { toast } from 'sonner';

export const notify = {
  success: (message: string) => {
    toast.success(message, {
      duration: 3000,
      style: {
        background: '#22c55e',
        color: 'white',
        border: 'none',
      },
    });
  },

  error: (message: string) => {
    toast.error(message, {
      duration: 4000,
      style: {
        background: '#ef4444',
        color: 'white',
        border: 'none',
      },
    });
  },

  info: (message: string) => {
    toast.info(message, {
      duration: 3000,
      style: {
        background: '#3b82f6',
        color: 'white',
        border: 'none',
      },
    });
  },

  warning: (message: string) => {
    toast.warning(message, {
      duration: 3000,
      style: {
        background: '#eab308',
        color: 'white',
        border: 'none',
      },
    });
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
