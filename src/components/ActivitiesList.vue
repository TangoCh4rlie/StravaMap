<template>
    <div class="activities-list">
        <div class="activities-header">
            <div class="activities-title-section">
                <h3 class="activities-title">
                    {{
                        loadingMode === "all"
                            ? "Toutes mes activités"
                            : "Activités récentes (30 jours)"
                    }}
                </h3>
                <div class="activities-toggle">
                    <button
                        class="toggle-btn"
                        :class="{ active: loadingMode === 'recent' }"
                        @click="switchMode('recent')"
                        :disabled="isLoading"
                    >
                        Récentes
                    </button>
                    <button
                        class="toggle-btn"
                        :class="{ active: loadingMode === 'all' }"
                        @click="switchMode('all')"
                        :disabled="isLoading"
                    >
                        Toutes
                    </button>
                </div>
            </div>
            <div class="activities-stats" v-if="activities.length > 0">
                <span class="stat-item">
                    {{ activities.length }} activité{{
                        activities.length > 1 ? "s" : ""
                    }}
                </span>
                <span class="stat-item"> {{ totalDistance }} km </span>
                <span class="stat-item">
                    {{ totalDuration }}
                </span>
            </div>
            <div v-else-if="!isLoading" class="activities-stats">
                <span class="stat-item">Aucune activité</span>
            </div>
        </div>

        <div v-if="isLoading" class="loading-container">
            <div class="loading-spinner"></div>
            <div class="loading-content">
                <p v-if="loadingProgress.current === 0">
                    Chargement des activités...
                </p>
                <p v-else>
                    Chargement... {{ loadingProgress.current }} activité{{
                        loadingProgress.current > 1 ? "s" : ""
                    }}
                    <span
                        v-if="loadingProgress.total > loadingProgress.current"
                    >
                        / ~{{ loadingProgress.total }}
                    </span>
                </p>
                <div v-if="loadingProgress.current > 0" class="progress-bar">
                    <div
                        class="progress-fill"
                        :style="{
                            width:
                                Math.min(
                                    (loadingProgress.current /
                                        Math.max(
                                            loadingProgress.total,
                                            loadingProgress.current,
                                        )) *
                                        100,
                                    100,
                                ) + '%',
                        }"
                    ></div>
                </div>
            </div>
        </div>

        <div v-else-if="error" class="error-container">
            <div class="error-message">
                <svg class="error-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                </svg>
                <span>{{ error }}</span>
                <button class="retry-btn" @click="loadActivities">
                    Réessayer
                </button>
            </div>
        </div>

        <div v-else-if="activities.length === 0" class="empty-state">
            <div class="empty-icon">🏃</div>
            <h4 v-if="loadingMode === 'recent'">Aucune activité récente</h4>
            <h4 v-else>Aucune activité trouvée</h4>
            <p v-if="loadingMode === 'recent'">
                Vous n'avez pas d'activités dans les 30 derniers jours. Essayez
                l'onglet "Toutes" pour voir l'ensemble de vos activités.
            </p>
            <p v-else>
                Il semble que vous n'ayez pas d'activités Strava ou qu'elles ne
                soient pas visibles avec les permissions actuelles.
            </p>
        </div>

        <div v-else class="activities-grid">
            <div
                v-for="activity in activities"
                :key="activity.id"
                class="activity-card"
                @click="selectActivity(activity)"
            >
                <div class="activity-header">
                    <div class="activity-type">
                        <span class="activity-emoji">{{
                            getActivityEmoji(activity.type)
                        }}</span>
                        <span class="activity-type-name">{{
                            getActivityTypeName(activity.type)
                        }}</span>
                    </div>
                    <div class="activity-name">{{ activity.name }}</div>
                </div>

                <div class="activity-stats">
                    <div class="stat">
                        <div class="stat-value">
                            {{ formatDistance(activity.distance) }} km
                        </div>
                        <div class="stat-label">Distance</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">
                            {{ formatDuration(activity.moving_time) }}
                        </div>
                        <div class="stat-label">Durée</div>
                    </div>
                    <div class="stat">
                        <div class="stat-value">
                            {{ Math.round(activity.total_elevation_gain) }} m
                        </div>
                        <div class="stat-label">Dénivelé</div>
                    </div>
                </div>

                <div class="activity-footer">
                    <div class="activity-date">
                        <svg
                            class="date-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"
                            />
                        </svg>
                        <span>{{ formatDate(activity.start_date_local) }}</span>
                    </div>
                    <div class="activity-time">
                        <svg
                            class="time-icon"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                        >
                            <path
                                d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"
                            />
                            <path
                                d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"
                            />
                        </svg>
                        <span>{{ formatTime(activity.start_date_local) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { StravaActivitiesService } from "../services/stravaActivities";
import type { StravaActivity } from "../types/strava";

// Props
interface Props {
    onActivitySelect?: (activity: StravaActivity) => void;
}

const props = withDefaults(defineProps<Props>(), {
    onActivitySelect: () => {},
});

// Reactive state
const activities = ref<StravaActivity[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loadingProgress = ref({ current: 0, total: 0 });
const loadingMode = ref<"recent" | "all">("recent");

// Computed properties
const totalDistance = computed(() => {
    const total = activities.value.reduce(
        (sum, activity) => sum + activity.distance,
        0,
    );
    return StravaActivitiesService.formatDistance(total);
});

const totalDuration = computed(() => {
    const total = activities.value.reduce(
        (sum, activity) => sum + activity.moving_time,
        0,
    );
    return StravaActivitiesService.formatDuration(total);
});

// Methods
const loadActivities = async () => {
    try {
        isLoading.value = true;
        error.value = null;
        loadingProgress.value = { current: 0, total: 0 };

        let fetchedActivities: StravaActivity[];

        if (loadingMode.value === "all") {
            fetchedActivities =
                await StravaActivitiesService.getAllActivitiesWithProgress(
                    (current, total, currentActivities) => {
                        loadingProgress.value = { current, total };
                        // Update activities in real-time for better UX
                        activities.value = [...currentActivities];
                    },
                );
        } else {
            fetchedActivities =
                await StravaActivitiesService.getRecentActivities(30);
        }

        activities.value = fetchedActivities;
        console.log(
            `Loaded ${fetchedActivities.length} ${loadingMode.value} activities`,
        );
    } catch (err) {
        console.error("Failed to load activities:", err);
        error.value =
            err instanceof Error
                ? err.message
                : "Erreur lors du chargement des activités";
    } finally {
        isLoading.value = false;
        loadingProgress.value = { current: 0, total: 0 };
    }
};

const switchMode = (mode: "recent" | "all") => {
    if (loadingMode.value !== mode && !isLoading.value) {
        loadingMode.value = mode;
        loadActivities();
    }
};

const selectActivity = (activity: StravaActivity) => {
    if (props.onActivitySelect) {
        props.onActivitySelect(activity);
    }
};

const formatDistance = (meters: number): string => {
    return StravaActivitiesService.formatDistance(meters);
};

const formatDuration = (seconds: number): string => {
    return StravaActivitiesService.formatDuration(seconds);
};

const formatDate = (dateString: string): string => {
    return StravaActivitiesService.formatDate(dateString);
};

const formatTime = (dateString: string): string => {
    return StravaActivitiesService.formatTime(dateString);
};

const getActivityEmoji = (type: string): string => {
    return StravaActivitiesService.getActivityEmoji(type);
};

const getActivityTypeName = (type: string): string => {
    return StravaActivitiesService.getActivityTypeName(type);
};

// Lifecycle
onMounted(() => {
    loadActivities();
});
</script>

<style scoped>
.activities-list {
    width: 100%;
    max-width: 800px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.activities-header {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    padding-top: 1.5rem;
}

.activities-title-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
}

.activities-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
}

.activities-toggle {
    display: flex;
    gap: 0.25rem;
    background: #f7fafc;
    padding: 0.25rem;
    border-radius: 8px;
}

.toggle-btn {
    background: transparent;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    color: #718096;
    cursor: pointer;
    transition: all 0.2s;
}

.toggle-btn:hover:not(:disabled) {
    background: #e2e8f0;
    color: #4a5568;
}

.toggle-btn.active {
    background: #fc4c02;
    color: white;
}

.toggle-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.activities-stats {
    display: flex;
    gap: 1rem;
    font-size: 0.875rem;
    color: #718096;
    margin-top: 0.5rem;
}

.stat-item {
    background: #f7fafc;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-weight: 500;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: #718096;
}

.loading-content {
    text-align: center;
    margin-top: 1rem;
}

.progress-bar {
    width: 200px;
    height: 4px;
    background: #e2e8f0;
    border-radius: 2px;
    margin-top: 1rem;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #fc4c02;
    transition: width 0.3s ease;
    border-radius: 2px;
}

.loading-spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid #e2e8f0;
    border-top: 3px solid #fc4c02;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.error-container {
    padding: 2rem;
    text-align: center;
}

.error-message {
    background: #fed7d7;
    color: #c53030;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 1rem;
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
}

.error-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.retry-btn {
    background: #c53030;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 0.25rem 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
    margin-left: 0.5rem;
}

.retry-btn:hover {
    background: #b91c1c;
}

.empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: #718096;
}

.empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.empty-state h4 {
    font-size: 1.25rem;
    color: #4a5568;
    margin: 0 0 0.5rem 0;
}

.empty-state p {
    margin: 0;
    line-height: 1.5;
}

.activities-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1rem;
    padding: 1rem 1rem;
    overflow-y: auto;
    flex: 1;
    max-height: calc(100vh - 200px);
}

.activity-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid #e2e8f0;
}

.activity-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    border-color: #fc4c02;
}

.activity-header {
    margin-bottom: 1rem;
}

.activity-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
}

.activity-emoji {
    font-size: 1.25rem;
}

.activity-type-name {
    background: #fc4c02;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.25rem 0.5rem;
    border-radius: 8px;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.activity-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
    line-height: 1.3;
}

.activity-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 1rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.75rem;
    color: #718096;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.activity-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.875rem;
    color: #718096;
}

.activity-date,
.activity-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.date-icon,
.time-icon {
    width: 1rem;
    height: 1rem;
}

@media (max-width: 768px) {
    .activities-list {
        margin-top: 1rem;
        height: 100%;
    }

    .activities-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
        padding: 0 0.5rem;
    }

    .activities-title-section {
        width: 100%;
    }

    .activities-toggle {
        align-self: flex-start;
    }

    .activities-stats {
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .activities-grid {
        grid-template-columns: 1fr;
        padding: 0 0.5rem;
        max-height: none;
    }

    .activity-stats {
        flex-direction: column;
        gap: 0.5rem;
    }

    .stat {
        display: flex;
        justify-content: space-between;
        align-items: center;
        text-align: left;
    }

    .stat-value {
        margin-bottom: 0;
    }

    .activity-footer {
        flex-direction: column;
        gap: 0.5rem;
        align-items: flex-start;
    }
}
</style>
