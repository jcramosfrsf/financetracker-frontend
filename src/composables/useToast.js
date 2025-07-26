import { ref, createApp } from 'vue';
import Toast from '@/components/Toast.vue';

const toasts = ref([]);

export const useToast = () => {
  const showToast = (options) => {
    const {
      message,
      title = '',
      type = 'info',
      duration = 5000,
      autoClose = true
    } = options;

    // Crear un contenedor único para este toast
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Crear la instancia del componente Toast
    const toastApp = createApp(Toast, {
      message,
      title,
      type,
      duration,
      autoClose,
      onClose: () => {
        // Limpiar cuando se cierre el toast
        toastApp.unmount();
        document.body.removeChild(container);
      }
    });

    // Montar el componente
    toastApp.mount(container);

    return toastApp;
  };

  const success = (message, title = 'Éxito') => {
    return showToast({ message, title, type: 'success' });
  };

  const error = (message, title = 'Error') => {
    return showToast({ message, title, type: 'error' });
  };

  const warning = (message, title = 'Advertencia') => {
    return showToast({ message, title, type: 'warning' });
  };

  const info = (message, title = 'Información') => {
    return showToast({ message, title, type: 'info' });
  };

  return {
    showToast,
    success,
    error,
    warning,
    info
  };
};