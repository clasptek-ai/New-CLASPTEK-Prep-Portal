export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    LOGOUT: '/api/v1/auth/logout',
    SESSION: '/api/v1/auth/session',
    REGISTER: '/api/v1/auth/register',
  },
  STUDENT: {
    PROFILE: '/api/v1/student/profile',
    PROGRAMMES: '/api/v1/student/programmes',
    NOTIFICATIONS: '/api/v1/student/notifications',
  },
} as const;
