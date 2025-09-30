/**
 * Environment configuration for dynamic URL handling
 * Supports both development and production environments
 */

export interface EnvironmentConfig {
  isDevelopment: boolean;
  isProduction: boolean;
  baseUrl: string;
  stravaRedirectUri: string;
  stravaClientId: string;
  stravaClientSecret: string;
  maptilerApiKey: string;
}

/**
 * Get the current environment configuration
 */
export const getEnvironmentConfig = (): EnvironmentConfig => {
  const isDevelopment = import.meta.env.DEV;
  const isProduction = import.meta.env.PROD;

  // Get base URL dynamically
  const baseUrl = isDevelopment
    ? 'http://localhost:5173'
    : window.location.origin;

  // Construct redirect URI
  const stravaRedirectUri = `${baseUrl}/auth/strava/callback`;

  return {
    isDevelopment,
    isProduction,
    baseUrl,
    stravaRedirectUri,
    stravaClientId: import.meta.env.VITE_STRAVA_CLIENT_ID || '',
    stravaClientSecret: import.meta.env.VITE_STRAVA_CLIENT_SECRET || '',
    maptilerApiKey: import.meta.env.VITE_MAPTILER_API_KEY || '',
  };
};

/**
 * Validate that all required environment variables are present
 */
export const validateEnvironment = (): boolean => {
  const config = getEnvironmentConfig();

  const requiredVars = [
    { name: 'VITE_STRAVA_CLIENT_ID', value: config.stravaClientId },
    { name: 'VITE_STRAVA_CLIENT_SECRET', value: config.stravaClientSecret },
    { name: 'VITE_MAPTILER_API_KEY', value: config.maptilerApiKey },
  ];

  const missing = requiredVars.filter(({ value }) => !value);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.map(v => v.name));
    return false;
  }

  return true;
};

/**
 * Get Strava redirect URI for current environment
 */
export const getStravaRedirectUri = (): string => {
  const config = getEnvironmentConfig();
  return config.stravaRedirectUri;
};

/**
 * Get current base URL
 */
export const getBaseUrl = (): string => {
  const config = getEnvironmentConfig();
  return config.baseUrl;
};
