<template>
  <div class="user-profile">
    <div class="profile-content">
      <img
        :src="athlete?.profile_medium"
        :alt="`${athlete?.firstname} ${athlete?.lastname}`"
        class="avatar"
      />
      <div class="user-info">
        <h3 class="user-name">{{ athlete?.firstname }} {{ athlete?.lastname }}</h3>
        <p class="user-location" v-if="athlete?.city && athlete?.country">
          {{ athlete.city }}, {{ athlete.country }}
        </p>
      </div>
      <div class="profile-actions">
        <button class="activities-btn" @click="toggleActivities" :class="{ active: showActivities }">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
          </svg>
        </button>
        <button class="logout-btn" @click="logout">
          <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { StravaAthlete } from '../types/strava'

// Props
interface Props {
  athlete: StravaAthlete | null
  showActivities?: boolean
  onLogout?: () => void
  onToggleActivities?: (show: boolean) => void
}

const props = withDefaults(defineProps<Props>(), {
  showActivities: false,
  onLogout: () => {},
  onToggleActivities: () => {}
})

// Reactive state
const showActivities = ref(props.showActivities)

// Methods
const logout = () => {
  if (props.onLogout) {
    props.onLogout()
  }
}

const toggleActivities = () => {
  showActivities.value = !showActivities.value
  if (props.onToggleActivities) {
    props.onToggleActivities(showActivities.value)
  }
}
</script>

<style scoped>
.user-profile {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 280px;
}

.profile-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  border: 2px solid #fc4c02;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-location {
  font-size: 0.75rem;
  color: #718096;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profile-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.activities-btn,
.logout-btn {
  background: #f7fafc;
  color: #4a5568;
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
}

.activities-btn:hover,
.logout-btn:hover {
  background: #e2e8f0;
  transform: translateY(-1px);
}

.activities-btn.active {
  background: #fc4c02;
  color: white;
}

.activities-btn.active:hover {
  background: #e63946;
}

.logout-btn:hover {
  background: #fed7d7;
  color: #c53030;
}

.btn-icon {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 640px) {
  .user-profile {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    min-width: auto;
    padding: 0.75rem;
  }

  .profile-content {
    gap: 0.5rem;
  }

  .avatar {
    width: 2.5rem;
    height: 2.5rem;
  }

  .user-name {
    font-size: 0.875rem;
  }

  .user-location {
    font-size: 0.6875rem;
  }

  .activities-btn,
  .logout-btn {
    width: 1.75rem;
    height: 1.75rem;
    padding: 0.375rem;
  }

  .btn-icon {
    width: 0.875rem;
    height: 0.875rem;
  }
}
</style>
