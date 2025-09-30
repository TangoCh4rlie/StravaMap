// Strava API Types

export interface StravaAthlete {
  id: number;
  username: string | null;
  resource_state: number;
  firstname: string;
  lastname: string;
  bio: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  sex: "M" | "F" | null;
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  badge_type_id: number;
  weight: number | null;
  profile_medium: string;
  profile: string;
  friend: string | null;
  follower: string | null;
}

export interface StravaTokenResponse {
  token_type: "Bearer";
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: "everyone" | "only_me" | "followers_only";
  flagged: boolean;
  gear_id: string | null;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out: boolean;
  display_hide_heartrate_option: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id?: number;
  upload_id_str?: string;
  external_id?: string;
  from_accepted_tag: boolean;
  pr_count: number;
  total_photo_count: number;
  has_kudoed: boolean;
  workout_type?: number;
  suffer_score?: number;
  description?: string | null;
  calories?: number;
  segment_efforts?: any[];
  splits_metric?: any[];
  splits_standard?: any[];
  laps?: any[];
  gear?: any;
  partner_brand_tag?: any;
  photos?: any;
  highlighted_kudosers?: any[];
  hide_from_home?: boolean;
  device_name?: string;
  embed_token?: string;
  segment_leaderboard_opt_out?: boolean;
  leaderboard_opt_out?: boolean;
}

export interface StravaDetailedActivity extends StravaActivity {
  description: string | null;
  photos: {
    primary: any;
    use_primary_photo: boolean;
    count: number;
  };
  gear: any;
  calories: number;
  segment_efforts: any[];
  device_name: string;
  embed_token: string;
  splits_metric: any[];
  splits_standard: any[];
  laps: any[];
  best_efforts: any[];
}

export interface StravaStream {
  type:
    | "latlng"
    | "distance"
    | "altitude"
    | "velocity_smooth"
    | "heartrate"
    | "cadence"
    | "watts"
    | "temp"
    | "moving"
    | "grade_smooth";
  data: number[][] | number[];
  series_type: "distance" | "time";
  original_size: number;
  resolution: "low" | "medium" | "high";
}

export interface StravaAuthState {
  isAuthenticated: boolean;
  athlete: StravaAthlete | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
}

// Activity types commonly used in Strava
export const STRAVA_ACTIVITY_TYPES = [
  "Run",
  "Ride",
  "Swim",
  "Hike",
  "Walk",
  "AlpineSki",
  "BackcountrySki",
  "Canoeing",
  "Crossfit",
  "EBikeRide",
  "Elliptical",
  "Golf",
  "Handcycle",
  "HighIntensityIntervalTraining",
  "Hockey",
  "IceSkate",
  "InlineSkate",
  "Kayaking",
  "Kitesurf",
  "NordicSki",
  "RockClimbing",
  "RollerSki",
  "Rowing",
  "Sail",
  "Skateboard",
  "Snowboard",
  "Snowshoe",
  "Soccer",
  "StairStepper",
  "StandUpPaddling",
  "Surfing",
  "Tennis",
  "TrailRun",
  "Velomobile",
  "VirtualRide",
  "VirtualRun",
  "WeightTraining",
  "Wheelchair",
  "Windsurf",
  "Workout",
  "Yoga",
] as const;

export type StravaActivityType = (typeof STRAVA_ACTIVITY_TYPES)[number];
