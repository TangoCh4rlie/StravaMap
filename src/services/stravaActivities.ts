import { StravaAuthService } from "./stravaAuth";
import type { StravaActivity, StravaStream } from "../types/strava";

export interface ActivityFilters {
  before?: number; // Unix timestamp
  after?: number; // Unix timestamp
  per_page?: number; // Max 200
  page?: number;
}

export class StravaActivitiesService {
  /**
   * Get athlete's activities with optional filters
   */
  static async getActivities(
    filters: ActivityFilters = {},
  ): Promise<StravaActivity[]> {
    const params = new URLSearchParams();

    // Default values
    const defaultFilters = {
      per_page: 30,
      page: 1,
      ...filters,
    };

    Object.entries(defaultFilters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const endpoint = `/athlete/activities?${params.toString()}`;

    return StravaAuthService.makeAuthenticatedRequest<StravaActivity[]>(
      endpoint,
    );
  }

  /**
   * Get ALL athlete's activities with automatic pagination
   * Returns activities sorted from most recent to oldest
   */
  static async getAllActivities(): Promise<StravaActivity[]> {
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200; // Maximum allowed by Strava API
    let hasMoreActivities = true;

    console.log("Starting to fetch all activities...");

    try {
      while (hasMoreActivities) {
        console.log(`Fetching page ${page}...`);

        const activities = await this.getActivities({
          per_page: perPage,
          page: page,
        });

        if (activities.length === 0) {
          // No more activities to fetch
          hasMoreActivities = false;
          console.log("No more activities found.");
        } else {
          allActivities.push(...activities);
          console.log(
            `Fetched ${activities.length} activities from page ${page}. Total: ${allActivities.length}`,
          );

          // If we got fewer activities than requested, we've reached the end
          if (activities.length < perPage) {
            hasMoreActivities = false;
            console.log("Reached end of activities (partial page).");
          } else {
            page++;
          }
        }

        // Add a small delay to avoid hitting rate limits
        if (hasMoreActivities) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Activities are already sorted by Strava API from most recent to oldest
      console.log(
        `Successfully fetched ${allActivities.length} total activities.`,
      );
      return allActivities;
    } catch (error) {
      console.error("Error fetching all activities:", error);
      throw new Error(
        `Failed to fetch all activities: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  /**
   * Get activities from the last N days
   */
  static async getRecentActivities(
    days: number = 30,
  ): Promise<StravaActivity[]> {
    const after = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

    return this.getActivities({
      after,
      per_page: 200, // Get more activities for recent period
    });
  }

  /**
   * Get activities with a progress callback for loading indication
   */
  static async getAllActivitiesWithProgress(
    onProgress?: (
      current: number,
      total: number,
      activities: StravaActivity[],
    ) => void,
  ): Promise<StravaActivity[]> {
    const allActivities: StravaActivity[] = [];
    let page = 1;
    const perPage = 200;
    let hasMoreActivities = true;
    let estimatedTotal = 0;

    try {
      while (hasMoreActivities) {
        const activities = await this.getActivities({
          per_page: perPage,
          page: page,
        });

        if (activities.length === 0) {
          hasMoreActivities = false;
        } else {
          allActivities.push(...activities);

          // Update estimated total (rough estimation)
          if (page === 1 && activities.length === perPage) {
            estimatedTotal = perPage * 3; // Conservative estimate
          }

          // Call progress callback if provided
          if (onProgress) {
            onProgress(
              allActivities.length,
              estimatedTotal || allActivities.length,
              [...allActivities],
            );
          }

          if (activities.length < perPage) {
            hasMoreActivities = false;
          } else {
            page++;
          }
        }

        // Small delay to avoid rate limits
        if (hasMoreActivities) {
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
      }

      // Final progress update
      if (onProgress) {
        onProgress(allActivities.length, allActivities.length, allActivities);
      }

      return allActivities;
    } catch (error) {
      console.error("Error fetching all activities with progress:", error);
      throw error;
    }
  }

  /**
   * Get activities of a specific type
   */
  static async getActivitiesByType(
    activityType: string,
    days: number = 30,
  ): Promise<StravaActivity[]> {
    const activities = await this.getRecentActivities(days);
    return activities.filter((activity) => activity.type === activityType);
  }

  /**
   * Format distance from meters to kilometers
   */
  static formatDistance(meters: number): string {
    const km = meters / 1000;
    return km < 10 ? km.toFixed(2) : km.toFixed(1);
  }

  /**
   * Format duration from seconds to readable format
   */
  static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, "0")}min`;
    }
    return `${minutes}min`;
  }

  /**
   * Format date to French locale
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  /**
   * Format time to French locale
   */
  static formatTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Get activity type emoji
   */
  static getActivityEmoji(type: string): string {
    const emojiMap: { [key: string]: string } = {
      Run: "🏃",
      TrailRun: "🏃‍♂️",
      Ride: "🚴",
      EBikeRide: "🚴‍♂️",
      VirtualRide: "🚴‍♂️",
      Swim: "🏊",
      Hike: "🥾",
      Walk: "🚶",
      AlpineSki: "⛷️",
      NordicSki: "🎿",
      Snowboard: "🏂",
      RockClimbing: "🧗",
      Kayaking: "🛶",
      Canoeing: "🛶",
      Rowing: "🚣",
      StandUpPaddling: "🏄",
      Surfing: "🏄",
      Kitesurf: "🪁",
      Windsurf: "🏄‍♂️",
      Sail: "⛵",
      Golf: "⛳",
      Tennis: "🎾",
      Soccer: "⚽",
      Hockey: "🏒",
      IceSkate: "⛸️",
      InlineSkate: "🛼",
      Skateboard: "🛹",
      WeightTraining: "🏋️",
      Crossfit: "🏋️‍♂️",
      Yoga: "🧘",
      Workout: "💪",
    };

    return emojiMap[type] || "🏃";
  }

  /**
   * Get French activity type name
   */
  static getActivityTypeName(type: string): string {
    const typeMap: { [key: string]: string } = {
      Run: "Course à pied",
      TrailRun: "Trail",
      Ride: "Vélo",
      EBikeRide: "Vélo électrique",
      VirtualRide: "Vélo virtuel",
      Swim: "Natation",
      Hike: "Randonnée",
      Walk: "Marche",
      AlpineSki: "Ski alpin",
      BackcountrySki: "Ski de randonnée",
      NordicSki: "Ski de fond",
      Snowboard: "Snowboard",
      Snowshoe: "Raquettes",
      RockClimbing: "Escalade",
      Kayaking: "Kayak",
      Canoeing: "Canoë",
      Rowing: "Aviron",
      StandUpPaddling: "Paddle",
      Surfing: "Surf",
      Kitesurf: "Kitesurf",
      Windsurf: "Planche à voile",
      Sail: "Voile",
      Golf: "Golf",
      Tennis: "Tennis",
      Soccer: "Football",
      Hockey: "Hockey",
      IceSkate: "Patin à glace",
      InlineSkate: "Roller",
      Skateboard: "Skateboard",
      WeightTraining: "Musculation",
      Crossfit: "Crossfit",
      HighIntensityIntervalTraining: "HIIT",
      Elliptical: "Elliptique",
      StairStepper: "Stepper",
      Yoga: "Yoga",
      Workout: "Entraînement",
    };

    return typeMap[type] || type;
  }

  /**
   * Get activity streams (GPS data, elevation, etc.) from Strava
   */
  static async getActivityStreams(
    activityId: number,
    streamTypes: string[] = ["latlng", "altitude", "distance"],
  ): Promise<{ [key: string]: StravaStream }> {
    const types = streamTypes.join(",");
    const endpoint = `/activities/${activityId}/streams?keys=${types}&key_by_type=true`;

    try {
      return await StravaAuthService.makeAuthenticatedRequest<{
        [key: string]: StravaStream;
      }>(endpoint);
    } catch (error) {
      console.error("Failed to fetch activity streams:", error);
      throw error;
    }
  }

  /**
   * Get activity GPS coordinates
   */
  static async getActivityGPSTrack(
    activityId: number,
  ): Promise<[number, number][]> {
    try {
      const streams = await this.getActivityStreams(activityId, ["latlng"]);

      // Get the latlng stream from the object
      const latlngStream = streams.latlng;

      if (!latlngStream || !latlngStream.data) {
        throw new Error("No GPS data available for this activity");
      }

      // Convert Strava format [[lat, lng], [lat, lng]] to Leaflet format
      return (latlngStream.data as number[][]).map(
        (coord) => [coord[0], coord[1]] as [number, number],
      );
    } catch (error) {
      console.error("Failed to get GPS track:", error);
      throw error;
    }
  }

  /**
   * Get activity color based on type
   */
  static getActivityColor(type: string): string {
    const colorMap: { [key: string]: string } = {
      Run: "#FF0000",
      TrailRun: "#8E44AD",
      Ride: "#3498DB",
      EBikeRide: "#2ECC71",
      VirtualRide: "#17A2B8",
      Swim: "#1ABC9C",
      Hike: "#F39C12",
      Walk: "#95A5A6",
      AlpineSki: "#E67E22",
      BackcountrySki: "#D35400",
      NordicSki: "#9B59B6",
      Snowboard: "#34495E",
      Snowshoe: "#BDC3C7",
      RockClimbing: "#A0522D",
      Kayaking: "#20B2AA",
      Canoeing: "#4682B4",
      Rowing: "#5F9EA0",
      StandUpPaddling: "#00CED1",
      Surfing: "#1E90FF",
      Kitesurf: "#FF6347",
      Windsurf: "#FF4500",
      Sail: "#4169E1",
      Golf: "#228B22",
      Tennis: "#FFD700",
      Soccer: "#32CD32",
      Hockey: "#B22222",
      IceSkate: "#87CEEB",
      InlineSkate: "#FF69B4",
      Skateboard: "#FF1493",
      WeightTraining: "#DC143C",
      Crossfit: "#B8860B",
      HighIntensityIntervalTraining: "#FF4500",
      Elliptical: "#9370DB",
      StairStepper: "#DA70D6",
      Yoga: "#DDA0DD",
      Workout: "#CD853F",
    };

    return colorMap[type] || "#FC4C02"; // Default Strava orange
  }
}
