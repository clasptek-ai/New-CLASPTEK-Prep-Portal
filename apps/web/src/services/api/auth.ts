import { interceptors } from './interceptors';

export function setupAuthInterceptor(getToken: () => string | null) {
  interceptors.request.push({
    onRequest: (config) => {
      const token = getToken();
      if (token) {
        const headers = new Headers(config.headers);
        headers.set('Authorization', `Bearer ${token}`);
        return { ...config, headers };
      }
      return config;
    },
  });
}
