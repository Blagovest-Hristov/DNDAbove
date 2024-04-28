import { createToast } from 'vue-toast-notification';
import 'vue-toastification/dist/index.css';

const toast = createToast();

const ErrorHandlerPlugin = {
  install(app) {
    // Install error handling interceptor
    app.config.errorHandler = (error) => {
      // Log the error for debugging purposes
      console.error('Global error occurred:', error);

      // Display a toast notification for the error
      toast.error('An error occurred. Please try again later.');

      // Optionally, you can also send the error to a logging service
      // logErrorToService(error, vm, info);
    };
  },
};

export default ErrorHandlerPlugin;
