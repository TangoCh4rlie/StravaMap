<template>
    <div class="strava-auth">
        <div v-if="!isAuthenticated" class="auth-container">
            <div class="auth-card">
                <div class="auth-header">
                    <h1 class="auth-title">Strava GPX Viewer</h1>
                    <p class="auth-subtitle">
                        Connectez votre compte Strava pour visualiser vos
                        activités sur une carte
                    </p>
                </div>

                <div class="auth-content">
                    <div class="strava-info">
                        <div class="info-item">
                            <svg
                                class="info-icon"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                                />
                            </svg>
                            <span>Accès sécurisé via OAuth</span>
                        </div>
                        <div class="info-item">
                            <svg
                                class="info-icon"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                />
                            </svg>
                            <span>Visualisation de toutes vos activités</span>
                        </div>
                        <div class="info-item">
                            <svg
                                class="info-icon"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                            >
                                <path
                                    d="M9 11H7v8h2v-8zm4-4h-2v12h2V7zm4-4h-2v16h2V3z"
                                />
                            </svg>
                            <span>Filtres par type et période</span>
                        </div>
                    </div>

                    <button
                        class="strava-connect-btn"
                        @click="connectToStrava"
                        :disabled="isConnecting"
                    >
                        <svg
                            v-if="!isConnecting"
                            class="btn-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M15.387 7.414L8.973 0L5.595 6.414L15.387 7.414ZM8.613 16.586L15.027 24L18.405 17.586L8.613 16.586Z"
                            />
                        </svg>
                        <div v-else class="loading-spinner"></div>
                        {{
                            isConnecting
                                ? "Connexion..."
                                : "Se connecter avec Strava"
                        }}
                    </button>

                    <p class="auth-disclaimer">
                        Nous n'accédons qu'à vos activités publiques. Vos
                        données restent privées et ne sont pas stockées sur nos
                        serveurs.
                    </p>
                </div>
            </div>
        </div>

        <div v-else class="authenticated-container">
            <div class="user-info">
                <img
                    :src="athlete?.profile_medium"
                    :alt="`${athlete?.firstname} ${athlete?.lastname}`"
                    class="avatar"
                />
                <div class="user-details">
                    <h2 class="user-name">
                        {{ athlete?.firstname }} {{ athlete?.lastname }}
                    </h2>
                    <p
                        class="user-location"
                        v-if="athlete?.city && athlete?.country"
                    >
                        {{ athlete.city }}, {{ athlete.country }}
                    </p>
                </div>
                <button class="logout-btn" @click="logout">
                    <svg
                        class="logout-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                        />
                    </svg>
                    Déconnexion
                </button>
            </div>

            <!-- Activities List -->
            <ActivitiesList @activity-select="handleActivitySelect" />
        </div>

        <!-- Error message -->
        <div v-if="error" class="error-container">
            <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                </svg>
                <span>{{ error }}</span>
                <button class="error-close" @click="clearError">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { StravaAuthService } from "../services/stravaAuth";
import type { StravaAthlete, StravaActivity } from "../types/strava";
import ActivitiesList from "./ActivitiesList.vue";

// Props
interface Props {
    onAuthSuccess?: (athlete: StravaAthlete) => void;
}

const props = withDefaults(defineProps<Props>(), {
    onAuthSuccess: () => {},
});

// Reactive state
const isConnecting = ref(false);
const error = ref<string | null>(null);
const athlete = ref<StravaAthlete | null>(null);

// Computed
const isAuthenticated = computed(() => StravaAuthService.isAuthenticated());

// Methods
const connectToStrava = () => {
    try {
        isConnecting.value = true;
        error.value = null;

        const authUrl = StravaAuthService.getAuthorizationUrl();
        window.location.href = authUrl;
    } catch (err) {
        console.error("Failed to initiate Strava connection:", err);
        error.value =
            "Erreur lors de la connexion à Strava. Veuillez réessayer.";
        isConnecting.value = false;
    }
};

const logout = () => {
    StravaAuthService.logout();
    athlete.value = null;
    error.value = null;
};

const clearError = () => {
    error.value = null;
};

const loadUserData = () => {
    if (StravaAuthService.isAuthenticated()) {
        athlete.value = StravaAuthService.getAthlete();
        if (athlete.value && props.onAuthSuccess) {
            props.onAuthSuccess(athlete.value);
        }
    }
};

const handleActivitySelect = (activity: StravaActivity) => {
    console.log("Activity selected:", activity);
    // TODO: Handle activity selection for map display
};

const handleAuthCallback = async () => {
    // Check if we're on the callback URL with a code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
        try {
            isConnecting.value = true;
            error.value = null;

            const tokenResponse =
                await StravaAuthService.exchangeCodeForToken(code);
            StravaAuthService.saveAuthState(tokenResponse);

            athlete.value = tokenResponse.athlete;

            if (props.onAuthSuccess) {
                props.onAuthSuccess(tokenResponse.athlete);
            }

            // Clean up URL
            window.history.replaceState(
                {},
                document.title,
                window.location.pathname,
            );
        } catch (err) {
            console.error("Auth callback error:", err);
            error.value =
                err instanceof Error
                    ? err.message
                    : "Erreur lors de l'authentification";
        } finally {
            isConnecting.value = false;
        }
    }
};

// Lifecycle
onMounted(() => {
    loadUserData();
    handleAuthCallback();
});
</script>

<style scoped>
.strava-auth {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 2rem;
}

.auth-container {
    width: 100%;
    max-width: 480px;
}

.auth-card {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.auth-header {
    background: linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%);
    color: white;
    padding: 2.5rem 2rem;
    text-align: center;
}

.auth-title {
    font-size: 2rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
}

.auth-subtitle {
    font-size: 1rem;
    opacity: 0.9;
    margin: 0;
    line-height: 1.4;
}

.auth-content {
    padding: 2rem;
}

.strava-info {
    margin-bottom: 2rem;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    color: #4a5568;
}

.info-icon {
    width: 1.25rem;
    height: 1.25rem;
    margin-right: 0.75rem;
    color: #48bb78;
}

.strava-connect-btn {
    width: 100%;
    background: #fc4c02;
    color: white;
    border: none;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.strava-connect-btn:hover:not(:disabled) {
    background: #e63946;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(252, 76, 2, 0.4);
}

.strava-connect-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-icon {
    width: 1.5rem;
    height: 1.5rem;
}

.loading-spinner {
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.auth-disclaimer {
    font-size: 0.875rem;
    color: #718096;
    text-align: center;
    margin: 1.5rem 0 0 0;
    line-height: 1.4;
}

.authenticated-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    width: 100%;
    max-width: 1200px;
}

.user-info {
    display: flex;
    align-items: center;
    padding: 2rem;
    gap: 1rem;
}

.avatar {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    border: 3px solid #fc4c02;
}

.user-details {
    flex: 1;
}

.user-name {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
    color: #2d3748;
}

.user-location {
    color: #718096;
    margin: 0;
    font-size: 0.875rem;
}

.logout-btn {
    background: #e2e8f0;
    color: #4a5568;
    border: none;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
}

.logout-btn:hover {
    background: #cbd5e0;
}

.logout-icon {
    width: 1rem;
    height: 1rem;
}

.error-container {
    position: fixed;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
}

.error-message {
    background: #fed7d7;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.error-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.error-close {
    background: none;
    border: none;
    color: #c53030;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.error-close:hover {
    background: rgba(197, 48, 48, 0.1);
}

.error-close svg {
    width: 1rem;
    height: 1rem;
}

@media (max-width: 640px) {
    .strava-auth {
        padding: 1rem;
    }

    .auth-header {
        padding: 2rem 1.5rem;
    }

    .auth-content {
        padding: 1.5rem;
    }

    .user-info {
        padding: 1.5rem;
        flex-direction: column;
        text-align: center;
    }

    .avatar {
        width: 3rem;
        height: 3rem;
    }
}
</style>
