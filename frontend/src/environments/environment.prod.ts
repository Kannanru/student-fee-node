// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://attendendance.askantech.com/api',
  socketUrl: 'https://attendendance.askantech.com',
  useMockData: false,
  enableLogging: false,
  version: '1.0.0',
  buildDate: new Date().toISOString()
};