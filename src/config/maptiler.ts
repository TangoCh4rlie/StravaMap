// MapTiler configuration
export const MAPTILER_CONFIG = {
  // Get your free API key at https://cloud.maptiler.com/
  // Free tier: 100,000 tile loads per month
  API_KEY:
    import.meta.env.VITE_MAPTILER_API_KEY ||
    "get_your_api_key_at_https://cloud.maptiler.com",

  // MapTiler style URLs
  // Available styles:
  // - TOPO: Topographic maps with contour lines (3D compatible) ✨
  // - OUTDOOR: Optimized for outdoor activities with trails
  // - HYBRID: Satellite imagery + labels (3D compatible) ✨
  // - STREETS: Modern urban style
  STYLES: {
    OUTDOOR: "https://api.maptiler.com/maps/outdoor-v2/style.json",
    HYBRID: "https://api.maptiler.com/maps/hybrid/style.json",
    STREETS: "https://api.maptiler.com/maps/streets-v2/style.json",
    TOPO: "https://api.maptiler.com/maps/topo-v2/style.json",
  },

  // Terrain source for 3D (works with TOPO and HYBRID styles)
  TERRAIN_SOURCE: "https://api.maptiler.com/tiles/terrain-rgb-v2/tiles.json",

  // Default map settings
  DEFAULT_CENTER: [2.3522, 48.8566], // Paris
  DEFAULT_ZOOM: 6,
  MAX_ZOOM: 18,

  // 3D Camera settings
  MAX_PITCH: 85, // Maximum camera tilt angle (default is 60°, max is 85°)
  DEFAULT_PITCH: 0, // Starting camera tilt
  TERRAIN_EXAGGERATION: 1.5, // Relief exaggeration multiplier
} as const;

// Helper function to get API key
export const getApiKey = () => MAPTILER_CONFIG.API_KEY;

// Helper function to get style URL with API key
export const getStyleUrl = (
  style: keyof typeof MAPTILER_CONFIG.STYLES = "TOPO",
) => {
  return `${MAPTILER_CONFIG.STYLES[style]}?key=${MAPTILER_CONFIG.API_KEY}`;
};

// Helper function to get terrain source URL with API key
export const getTerrainSourceUrl = () => {
  return `${MAPTILER_CONFIG.TERRAIN_SOURCE}?key=${MAPTILER_CONFIG.API_KEY}`;
};
