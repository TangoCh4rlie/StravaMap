import type { StravaTokenResponse, StravaAuthState } from "../types/strava";
import { getEnvironmentConfig } from "../config/env";

export class StravaAuthService {
  private static readonly STRAVA_BASE_URL = "https://www.strava.com/api/v3";
  private static readonly STRAVA_AUTH_URL =
    "https://www.strava.com/oauth/authorize";
  private static readonly STRAVA_TOKEN_URL =
    "https://www.strava.com/oauth/token";

  private static readonly CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;

  private static readonly STORAGE_KEY = "strava_auth_state";

  /**
   * Generate the Strava OAuth authorization URL
   */
  static getAuthorizationUrl(): string {
    const config = getEnvironmentConfig();
    const params = new URLSearchParams({
      client_id: this.CLIENT_ID,
      response_type: "code",
      redirect_uri: config.stravaRedirectUri,
      approval_prompt: "force",
      scope: "read,activity:read_all",
    });

    return `${this.STRAVA_AUTH_URL}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(
    code: string,
  ): Promise<StravaTokenResponse> {
    const response = await fetch(this.STRAVA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to exchange code for token: ${error.message || response.statusText}`,
      );
    }

    return response.json();
  }

  /**
   * Save authentication state to localStorage
   */
  static saveAuthState(tokenResponse: StravaTokenResponse): void {
    const authState: StravaAuthState = {
      isAuthenticated: true,
      athlete: tokenResponse.athlete,
      accessToken: tokenResponse.access_token,
      refreshToken: tokenResponse.refresh_token,
      expiresAt: tokenResponse.expires_at * 1000, // Convert to milliseconds
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
  }

  /**
   * Load authentication state from localStorage
   */
  static loadAuthState(): StravaAuthState {
    const defaultState: StravaAuthState = {
      isAuthenticated: false,
      athlete: null,
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
    };

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return defaultState;

      const authState: StravaAuthState = JSON.parse(stored);

      // Check if token is expired
      if (authState.expiresAt && Date.now() > authState.expiresAt) {
        this.clearAuthState();
        return defaultState;
      }

      return authState;
    } catch (error) {
      console.error("Failed to load auth state:", error);
      this.clearAuthState();
      return defaultState;
    }
  }

  /**
   * Clear authentication state
   */
  static clearAuthState(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Check if user is currently authenticated
   */
  static isAuthenticated(): boolean {
    const authState = this.loadAuthState();
    return (
      authState.isAuthenticated &&
      authState.accessToken !== null &&
      authState.expiresAt !== null &&
      Date.now() < authState.expiresAt
    );
  }

  /**
   * Get current access token
   */
  static getAccessToken(): string | null {
    const authState = this.loadAuthState();
    return authState.isAuthenticated ? authState.accessToken : null;
  }

  /**
   * Get current athlete info
   */
  static getAthlete() {
    const authState = this.loadAuthState();
    return authState.athlete;
  }

  /**
   * Logout user
   */
  static logout(): void {
    this.clearAuthState();
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(): Promise<StravaTokenResponse> {
    const authState = this.loadAuthState();

    if (!authState.refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch(this.STRAVA_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: this.CLIENT_ID,
        client_secret: import.meta.env.VITE_STRAVA_CLIENT_SECRET,
        refresh_token: authState.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Failed to refresh token: ${error.message || response.statusText}`,
      );
    }

    const tokenResponse = await response.json();
    this.saveAuthState(tokenResponse);

    return tokenResponse;
  }

  /**
   * Make authenticated API request to Strava
   */
  static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    let accessToken = this.getAccessToken();

    if (!accessToken) {
      throw new Error("No access token available");
    }

    // Try to refresh token if it's close to expiring (within 5 minutes)
    const authState = this.loadAuthState();
    if (
      authState.expiresAt &&
      authState.expiresAt - Date.now() < 5 * 60 * 1000
    ) {
      try {
        await this.refreshAccessToken();
        accessToken = this.getAccessToken();
      } catch (error) {
        console.warn("Failed to refresh token:", error);
      }
    }

    const response = await fetch(`${this.STRAVA_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token is invalid, clear auth state
        this.clearAuthState();
        throw new Error("Authentication failed. Please log in again.");
      }

      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `API request failed: ${error.message || response.statusText}`,
      );
    }

    return response.json();
  }
}
