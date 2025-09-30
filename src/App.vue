<template>
    <div id="app">
        <!-- Authentication screen -->
        <div v-if="!isAuthenticated" class="auth-screen">
            <StravaAuth @auth-success="handleAuthSuccess" />
        </div>

        <!-- Main app with map -->
        <div v-else class="main-app">
            <!-- User profile overlay -->
            <UserProfile
                :athlete="authenticatedAthlete"
                :show-activities="showActivitiesPanel"
                @logout="handleLogout"
                @toggle-activities="handleToggleActivities"
            />

            <!-- Activities panel (sliding from right) -->
            <div
                class="activities-panel"
                :class="{ 'panel-open': showActivitiesPanel }"
            >
                <div class="activities-panel-content">
                    <div class="activities-header">
                        <h3>Mes activités</h3>
                        <button
                            class="close-panel-btn"
                            @click="closeActivitiesPanel"
                        >
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path
                                    d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                                />
                            </svg>
                        </button>
                    </div>
                    <div class="activities-scroll-container">
                        <ActivitiesList
                            @activity-select="handleActivitySelect"
                        />
                    </div>
                </div>
            </div>

            <!-- Overlay for activities panel -->
            <div
                v-if="showActivitiesPanel"
                class="panel-overlay"
                @click="closeActivitiesPanel"
            ></div>

            <!-- Loading indicator for track -->
            <div v-if="isLoadingTrack" class="track-loading">
                <div class="track-loading-content">
                    <div class="loading-spinner"></div>
                    <span>Chargement de la trace GPS...</span>
                </div>
            </div>

            <!-- Track error message -->
            <div v-if="trackError" class="track-error">
                <div class="track-error-content">
                    <svg
                        class="error-icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        />
                    </svg>
                    <span>{{ trackError }}</span>
                    <button
                        class="track-error-close"
                        @click="trackError = null"
                    >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path
                                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Map container -->
            <div class="map-container">
                <Map
                    ref="mapComponent"
                    :initial-center="mapCenter"
                    :initial-zoom="mapZoom"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { StravaAuthService } from "./services/stravaAuth";
import { StravaActivitiesService } from "./services/stravaActivities";
import type { StravaAthlete, StravaActivity } from "./types/strava";
import StravaAuth from "./components/StravaAuth.vue";
import UserProfile from "./components/UserProfile.vue";
import ActivitiesList from "./components/ActivitiesList.vue";
import Map from "./components/Map.vue";

// Reactive state
const authenticatedAthlete = ref<StravaAthlete | null>(null);
const showActivitiesPanel = ref(false);
const mapComponent = ref();
const isLoadingTrack = ref(false);
const trackError = ref<string | null>(null);

// Map configuration
const mapCenter = ref<[number, number]>([46.603354, 1.888334]); // Centre de la France
const mapZoom = ref(6);

// Computed
const isAuthenticated = computed(() => {
    return (
        StravaAuthService.isAuthenticated() &&
        authenticatedAthlete.value !== null
    );
});

// Methods
const handleAuthSuccess = (athlete: StravaAthlete) => {
    authenticatedAthlete.value = athlete;
    console.log("User authenticated:", athlete);

    // TODO: Optionally center map on user's location or activities
    if (athlete.city) {
        // Could geocode the city to center the map, but for now keep default
    }
};

const handleLogout = () => {
    StravaAuthService.logout();
    authenticatedAthlete.value = null;
    showActivitiesPanel.value = false;
};

const handleToggleActivities = (show: boolean) => {
    showActivitiesPanel.value = show;
};

const closeActivitiesPanel = () => {
    showActivitiesPanel.value = false;
};

const handleActivitySelect = async (activity: StravaActivity) => {
    console.log("Activity selected:", activity);

    // Close activities panel
    showActivitiesPanel.value = false;

    // Clear any previous errors
    trackError.value = null;

    // Load and display GPS track
    await loadActivityTrack(activity);
};

const loadActivityTrack = async (activity: StravaActivity) => {
    if (!mapComponent.value) return;

    try {
        isLoadingTrack.value = true;
        trackError.value = null;

        // Clear previous track
        mapComponent.value.clearMap();

        // Get GPS coordinates from Strava
        const coordinates = await StravaActivitiesService.getActivityGPSTrack(
            activity.id,
        );

        if (coordinates.length === 0) {
            throw new Error("Aucune donnée GPS disponible pour cette activité");
        }

        // Get activity color
        const color = StravaActivitiesService.getActivityColor(activity.type);
        const activityTypeName = StravaActivitiesService.getActivityTypeName(
            activity.type,
        );

        // Add track to map
        mapComponent.value.addTrack(coordinates, {
            color,
            weight: 3,
            opacity: 0.8,
            activityName: activity.name,
            activityType: activityTypeName,
        });

        // Add start/end markers
        mapComponent.value.addTrackMarkers(coordinates, activity.name);

        console.log(
            `Track loaded for activity: ${activity.name} (${coordinates.length} points)`,
        );
    } catch (error) {
        console.error("Failed to load activity track:", error);
        trackError.value =
            error instanceof Error
                ? error.message
                : "Erreur lors du chargement de la trace";

        // Fallback: center on start coordinates if available
        if (activity.start_latlng && mapComponent.value) {
            const [lat, lng] = activity.start_latlng;
            mapComponent.value.setView([lat, lng], 13);
        }
    } finally {
        isLoadingTrack.value = false;
    }
};

const loadUserData = () => {
    if (StravaAuthService.isAuthenticated()) {
        authenticatedAthlete.value = StravaAuthService.getAthlete();
    }
};

// Lifecycle
onMounted(() => {
    loadUserData();
});
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html,
body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    background: #ffffff;
    font-family:
        -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#app {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.auth-screen {
    height: 100%;
    width: 100%;
}

.main-app {
    height: 100%;
    width: 100%;
    position: relative;
    overflow: hidden;
}

.map-container {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
}

.activities-panel {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: white;
    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
    transition: right 0.3s ease-in-out;
    z-index: 1500;
    overflow: hidden;
}

.activities-panel.panel-open {
    right: 0;
}

.activities-panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.activities-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #e2e8f0;
    background: #f7fafc;
}

.activities-header h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
}

.close-panel-btn {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 6px;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
}

.close-panel-btn:hover {
    background: #e2e8f0;
    color: #4a5568;
}

.close-panel-btn svg {
    width: 1.25rem;
    height: 1.25rem;
}

.panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1400;
    cursor: pointer;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
    .activities-panel {
        width: 100vw;
        right: -100vw;
    }

    .activities-panel.panel-open {
        right: 0;
    }

    .activities-header {
        padding: 1rem;
    }

    .activities-header h3 {
        font-size: 1.125rem;
    }
}

/* Activities scroll container */
.activities-scroll-container {
    flex: 1;
    overflow-y: auto;
    padding: 0;
}

/* Ensure activities list fits in panel */
.activities-panel :deep(.activities-list) {
    margin: 0;
    max-width: none;
    height: auto;
}

.activities-panel :deep(.activities-grid) {
    padding: 1rem;
    grid-template-columns: 1fr;
    gap: 1rem;
    overflow-y: visible;
    max-height: none;
}

.activities-panel :deep(.activities-header) {
    display: none; /* Hide duplicate header */
}

.activities-scroll-container::-webkit-scrollbar {
    width: 8px;
}

.activities-scroll-container::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
}

.activities-scroll-container::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}

.activities-scroll-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* Track loading indicator */
.track-loading {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 1rem 1.5rem;
}

.track-loading-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #4a5568;
    font-size: 0.875rem;
    font-weight: 500;
}

.track-loading .loading-spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #e2e8f0;
    border-top: 2px solid #fc4c02;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

/* Track error message */
.track-error {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    background: #fed7d7;
    border: 1px solid #feb2b2;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 1rem 1.5rem;
    max-width: 400px;
}

.track-error-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #c53030;
    font-size: 0.875rem;
}

.track-error .error-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
}

.track-error-close {
    background: none;
    border: none;
    color: #c53030;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
}

.track-error-close:hover {
    background: rgba(197, 48, 48, 0.1);
}

.track-error-close svg {
    width: 1rem;
    height: 1rem;
}

@media (max-width: 640px) {
    .track-loading,
    .track-error {
        left: 1rem;
        right: 1rem;
        transform: none;
        max-width: none;
    }
}
</style>
