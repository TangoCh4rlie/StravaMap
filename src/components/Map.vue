<template>
    <div ref="mapContainer" class="map-container">
        <!-- Style Selector and 3D Toggle -->
        <div class="map-controls">
            <button
                v-if="supports3D"
                @click="toggle3D"
                :class="['terrain-toggle', { active: is3DEnabled }]"
                :title="is3DEnabled ? 'Désactiver la 3D' : 'Activer la 3D'"
            >
                <span class="terrain-icon">🏔️</span>
                <span class="terrain-text">3D</span>
            </button>
            <select
                v-model="currentStyle"
                @change="changeStyle"
                class="style-selector"
            >
                <option value="TOPO">Topographic</option>
                <option value="HYBRID">Hybrid</option>
                <option value="OUTDOOR">Outdoor</option>
                <option value="STREETS">Streets</option>
            </select>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
    getStyleUrl,
    getTerrainSourceUrl,
    MAPTILER_CONFIG,
} from "../config/maptiler";

// Props
interface Props {
    initialCenter?: [number, number];
    initialZoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
    initialCenter: () => [2.3522, 48.8566], // Paris [longitude, latitude]
    initialZoom: 6,
});

// Reactive state
const mapContainer = ref<HTMLElement>();
const currentStyle = ref<keyof typeof MAPTILER_CONFIG.STYLES>("TOPO");
const is3DEnabled = ref(false);
const cameraAngle = ref(0);
const supports3D = computed(
    () => currentStyle.value === "TOPO" || currentStyle.value === "HYBRID",
);
let map: maplibregl.Map | null = null;
let currentTrackSource: string | null = null;
let currentTrackLayer: string | null = null;
let currentMarkers: maplibregl.Marker[] = [];
let allTracks: Map<string, { sourceId: string; layerId: string }> = new Map();
let allTrackMarkers: maplibregl.Marker[] = [];

// Methods
const initializeMap = async () => {
    if (!mapContainer.value) return;

    try {
        // Create map
        map = new maplibregl.Map({
            container: mapContainer.value,
            style: getStyleUrl(currentStyle.value),
            center: props.initialCenter,
            zoom: props.initialZoom,
            pitch: MAPTILER_CONFIG.DEFAULT_PITCH,
            maxZoom: MAPTILER_CONFIG.MAX_ZOOM,
            maxPitch: MAPTILER_CONFIG.MAX_PITCH, // Allow steep camera angles (default is 60°)
        });

        // Add navigation controls
        map.addControl(new maplibregl.NavigationControl(), "top-left");

        // Add scale control
        map.addControl(new maplibregl.ScaleControl(), "bottom-left");

        // Add camera angle tracking
        map.on("pitch", updateCameraAngle);
        map.on("pitchend", updateCameraAngle);

        // Add keyboard shortcuts
        setupKeyboardControls();

        // Add terrain control for 3D terrain (only for compatible styles)
        addTerrainControlIfSupported();

        // Wait for map to load
        await new Promise<void>((resolve) => {
            map!.on("load", () => {
                console.log("Map loaded, style:", currentStyle.value);
                resolve();
            });
        });

        console.log("Map initialized successfully");
    } catch (error) {
        console.error("Error initializing map:", error);
    }
};

// Camera controls
const updateCameraAngle = () => {
    if (map) {
        cameraAngle.value = map.getPitch();
    }
};

const setupKeyboardControls = () => {
    if (!map) return;

    // Add keyboard event listener to map canvas
    const canvas = map.getCanvas();
    canvas.setAttribute("tabindex", "0");

    canvas.addEventListener("keydown", (e) => {
        if (!is3DEnabled.value) return;

        switch (e.key.toLowerCase()) {
            case "r":
                // Reset camera angle
                if (map) {
                    map.easeTo({
                        pitch: 0,
                        bearing: 0,
                        duration: 1000,
                    });
                }
                break;
            case "arrowup":
                // Increase pitch
                e.preventDefault();
                if (map) {
                    const currentPitch = map.getPitch();
                    const newPitch = Math.min(
                        currentPitch + 10,
                        MAPTILER_CONFIG.MAX_PITCH,
                    );
                    map.easeTo({ pitch: newPitch, duration: 300 });
                }
                break;
            case "arrowdown":
                // Decrease pitch
                e.preventDefault();
                if (map) {
                    const currentPitchDown = map.getPitch();
                    const newPitchDown = Math.max(currentPitchDown - 10, 0);
                    map.easeTo({ pitch: newPitchDown, duration: 300 });
                }
                break;
        }
    });
};

const destroyMap = () => {
    if (map) {
        // Remove all markers
        clearMarkers();
        // Remove terrain control
        removeTerrainControl();
        // Remove event listeners
        map.off("pitch", updateCameraAngle);
        map.off("pitchend", updateCameraAngle);
        map.remove();
        map = null;
    }
};

// Terrain control management
const setupTerrainSource = () => {
    if (!map || !supports3D.value) return;

    try {
        // Check if terrain source exists in the style
        let terrainSource = map.getSource("terrain");

        if (!terrainSource) {
            // Add MapTiler terrain source manually
            map.addSource("terrain", {
                type: "raster-dem",
                url: getTerrainSourceUrl(),
                tileSize: 256,
            });
            console.log("Added terrain source manually");
        }
    } catch (error) {
        console.warn("Error setting up terrain source:", error);
    }
};

const toggle3D = () => {
    if (!map || !supports3D.value) return;

    try {
        if (is3DEnabled.value) {
            // Disable 3D
            map.setTerrain(null);
            is3DEnabled.value = false;
            console.log("3D terrain disabled");
        } else {
            // Enable 3D
            setupTerrainSource();
            map.setTerrain({
                source: "terrain",
                exaggeration: MAPTILER_CONFIG.TERRAIN_EXAGGERATION,
            });
            is3DEnabled.value = true;
            updateCameraAngle();
            console.log("3D terrain enabled");
        }
    } catch (error) {
        console.warn("Error toggling 3D terrain:", error);
    }
};

const addTerrainControlIfSupported = () => {
    if (!map || !supports3D.value) return;

    // Wait for style to be fully loaded before setting up terrain
    map.once("style.load", () => {
        setupTerrainSource();

        // Reset 3D state when style changes
        if (is3DEnabled.value) {
            setTimeout(() => {
                toggle3D();
            }, 100);
        }
    });
};

const removeTerrainControl = () => {
    if (map) {
        try {
            // Remove terrain from map
            map.setTerrain(null);
            is3DEnabled.value = false;
            cameraAngle.value = 0;
        } catch (error) {
            console.warn("Error removing terrain:", error);
        }
    }
};

// Style management
const changeStyle = async () => {
    if (!map) return;

    try {
        // Store current track data before style change
        const currentTrackData = getCurrentTrackData();

        // Remove terrain control before style change
        removeTerrainControl();

        map.setStyle(getStyleUrl(currentStyle.value));

        // Wait for style to load and re-add features
        map.once("styledata", () => {
            console.log("Style changed to:", currentStyle.value);

            // Reset 3D state if switching to non-3D compatible style
            if (!supports3D.value && is3DEnabled.value) {
                is3DEnabled.value = false;
            }

            // Re-add track if it exists
            if (currentTrackData) {
                addTrack(
                    currentTrackData.coordinates,
                    currentTrackData.options,
                );
            }

            // Re-add terrain control if supported (after a small delay to ensure style is fully loaded)
            setTimeout(() => {
                addTerrainControlIfSupported();
            }, 100);
        });
    } catch (error) {
        console.error("Error changing map style:", error);
    }
};

// Track management
let storedTrackData: {
    coordinates: [number, number][];
    options: {
        color?: string;
        weight?: number;
        opacity?: number;
        activityName?: string;
        activityType?: string;
    };
} | null = null;

const getCurrentTrackData = () => {
    return storedTrackData;
};

/**
 * Add GPS track to the map
 */
const addTrack = (
    coordinates: [number, number][],
    options: {
        color?: string;
        weight?: number;
        opacity?: number;
        activityName?: string;
        activityType?: string;
        multiple?: boolean;
    } = {},
) => {
    if (!map || coordinates.length === 0) return;

    // Remove existing track only if not in multiple mode
    if (!options.multiple) {
        removeCurrentTrack();
        clearAllTracks();
    }

    // Default options
    const trackOptions = {
        color: options.color || "#FC4C02",
        weight: options.weight || 3,
        opacity: options.opacity || 0.8,
    };

    // Convert coordinates to GeoJSON LineString format
    // MapLibre expects [lng, lat], but we receive [lat, lng]
    const lineCoordinates = coordinates.map((coord) => [coord[1], coord[0]]);

    const trackId = `track-${Date.now()}`;
    const sourceId = `${trackId}-source`;
    const layerId = `${trackId}-layer`;

    // Create GeoJSON source
    const geojson: GeoJSON.Feature<GeoJSON.LineString> = {
        type: "Feature",
        properties: {
            name: options.activityName || "",
            type: options.activityType || "",
        },
        geometry: {
            type: "LineString",
            coordinates: lineCoordinates,
        },
    };

    try {
        // Add source
        map.addSource(sourceId, {
            type: "geojson",
            data: geojson,
        });

        // Add layer
        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            layout: {
                "line-join": "round",
                "line-cap": "round",
            },
            paint: {
                "line-color": trackOptions.color,
                "line-width": trackOptions.weight,
                "line-opacity": trackOptions.opacity,
            },
        });

        // Store references and data
        if (options.multiple) {
            // Store in all tracks for multiple mode
            allTracks.set(trackId, { sourceId, layerId });
        } else {
            // Store as current track for single mode
            currentTrackSource = sourceId;
            currentTrackLayer = layerId;
            storedTrackData = { coordinates, options };
        }

        // Fit map to track bounds
        const bounds = new maplibregl.LngLatBounds();
        lineCoordinates.forEach((coord) => {
            bounds.extend(coord as [number, number]);
        });

        map.fitBounds(bounds, {
            padding: 50,
            duration: 1000,
        });

        // Add click popup
        if (options.activityName) {
            map.on("click", layerId, (e) => {
                const popupContent = `
                    <div style="text-align: center; font-family: inherit;">
                        <strong style="color: #2d3748;">${options.activityName}</strong>
                        ${options.activityType ? `<br><small style="color: #718096;">${options.activityType}</small>` : ""}
                    </div>
                `;

                new maplibregl.Popup()
                    .setLngLat(e.lngLat)
                    .setHTML(popupContent)
                    .addTo(map!);
            });

            // Change cursor on hover
            map.on("mouseenter", layerId, () => {
                if (map) map.getCanvas().style.cursor = "pointer";
            });

            map.on("mouseleave", layerId, () => {
                if (map) map.getCanvas().style.cursor = "";
            });
        }

        console.log("Track added successfully");
        return layerId;
    } catch (error) {
        console.error("Error adding track:", error);
        return null;
    }
};

/**
 * Add multiple tracks to the map
 */
const addMultipleTracks = async (
    tracksData: Array<{
        coordinates: [number, number][];
        options: {
            color?: string;
            weight?: number;
            opacity?: number;
            activityName?: string;
            activityType?: string;
        };
    }>,
) => {
    if (!map) return;

    // Clear existing tracks
    clearAllTracks();

    // Add all tracks
    for (const trackData of tracksData) {
        addTrack(trackData.coordinates, {
            ...trackData.options,
            multiple: true,
        });
    }

    console.log(`Added ${tracksData.length} tracks to map`);
};

/**
 * Clear all tracks from map
 */
const clearAllTracks = () => {
    if (!map) return;

    // Remove all tracks stored in allTracks
    for (const [trackId, { sourceId, layerId }] of allTracks) {
        try {
            if (map.getLayer(layerId)) {
                map.removeLayer(layerId);
            }
            if (map.getSource(sourceId)) {
                map.removeSource(sourceId);
            }
        } catch (error) {
            console.warn(`Error removing track ${trackId}:`, error);
        }
    }

    allTracks.clear();

    // Also clear all track markers
    allTrackMarkers.forEach((marker) => marker.remove());
    allTrackMarkers = [];
};

/**
 * Remove current track from map
 */
const removeCurrentTrack = () => {
    if (!map || !currentTrackSource || !currentTrackLayer) return;

    try {
        // Remove layer first, then source
        if (map.getLayer(currentTrackLayer)) {
            map.removeLayer(currentTrackLayer);
        }
        if (map.getSource(currentTrackSource)) {
            map.removeSource(currentTrackSource);
        }

        currentTrackSource = null;
        currentTrackLayer = null;
        storedTrackData = null;
    } catch (error) {
        console.error("Error removing track:", error);
    }
};

/**
 * Add start/end markers to track
 */
const addTrackMarkers = (
    coordinates: [number, number][],
    activityName?: string,
    options: { multiple?: boolean } = {},
) => {
    if (!map || coordinates.length === 0) return;

    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];

    if (!startCoord || !endCoord) return;

    // Convert [lat, lng] to [lng, lat] for MapLibre
    const startLngLat: [number, number] = [startCoord[1], startCoord[0]];
    const endLngLat: [number, number] = [endCoord[1], endCoord[0]];

    // Create custom marker elements
    const createMarkerElement = (type: "start" | "end") => {
        const el = document.createElement("div");
        el.style.cssText = `
            background: ${type === "start" ? "#10B981" : "#EF4444"};
            color: white;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 12px;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            cursor: pointer;
        `;
        el.textContent = type === "start" ? "S" : "F";
        return el;
    };

    // Create and add markers
    const startMarker = new maplibregl.Marker({
        element: createMarkerElement("start"),
    })
        .setLngLat(startLngLat)
        .setPopup(
            new maplibregl.Popup().setHTML(
                `<strong>Départ</strong>${activityName ? `<br>${activityName}` : ""}`,
            ),
        )
        .addTo(map);

    const endMarker = new maplibregl.Marker({
        element: createMarkerElement("end"),
    })
        .setLngLat(endLngLat)
        .setPopup(
            new maplibregl.Popup().setHTML(
                `<strong>Arrivée</strong>${activityName ? `<br>${activityName}` : ""}`,
            ),
        )
        .addTo(map);

    // Store markers for cleanup
    if (options.multiple) {
        allTrackMarkers.push(startMarker, endMarker);
    } else {
        currentMarkers.push(startMarker, endMarker);
    }

    return { startMarker, endMarker };
};

/**
 * Clear all markers
 */
const clearMarkers = () => {
    currentMarkers.forEach((marker) => marker.remove());
    currentMarkers = [];
};

/**
 * Clear all tracks and markers
 */
const clearMap = () => {
    removeCurrentTrack();
    clearAllTracks();
    clearMarkers();
};

// Expose methods to parent component
const getMap = () => map;

const setView = (center: [number, number], zoom?: number) => {
    if (map) {
        // Convert [lat, lng] to [lng, lat] for MapLibre
        const lngLat: [number, number] = [center[1], center[0]];
        map.jumpTo({
            center: lngLat,
            zoom: zoom || map.getZoom(),
        });
    }
};

const fitBounds = (
    bounds: [[number, number], [number, number]],
    options?: maplibregl.FitBoundsOptions,
) => {
    if (map) {
        // Convert [[lat, lng], [lat, lng]] to [[lng, lat], [lng, lat]] for MapLibre
        const lngLatBounds: [[number, number], [number, number]] = [
            [bounds[0][1], bounds[0][0]], // sw: [lng, lat]
            [bounds[1][1], bounds[1][0]], // ne: [lng, lat]
        ];
        map.fitBounds(lngLatBounds, options);
    }
};

defineExpose({
    getMap,
    setView,
    fitBounds,
    addTrack,
    addMultipleTracks,
    removeCurrentTrack,
    clearAllTracks,
    addTrackMarkers,
    clearMap,
    clearMarkers,
});

// Lifecycle
onMounted(async () => {
    await nextTick();
    await initializeMap();
});

onUnmounted(() => {
    destroyMap();
});
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100%;
    position: relative;
    z-index: 0;
}

.map-controls {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 1000;
    display: flex;
    gap: 8px;
    align-items: center;
}

.style-selector {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
}

.style-selector:hover {
    background: rgba(252, 76, 2, 0.1);
    border-color: #fc4c02;
}

.style-selector:focus {
    border-color: #fc4c02;
    box-shadow: 0 0 0 3px rgba(252, 76, 2, 0.1);
}

.terrain-toggle {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    outline: none;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 4px;
}

.terrain-toggle:hover {
    background: rgba(252, 76, 2, 0.1);
    border-color: #fc4c02;
    transform: translateY(-1px);
}

.terrain-toggle.active {
    background: #fc4c02;
    color: white;
    border-color: #fc4c02;
}

.terrain-toggle.active:hover {
    background: #e64002;
}

.terrain-icon {
    font-size: 16px;
}

.terrain-text {
    font-weight: 600;
}

.camera-info {
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    padding: 8px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 12px;
}

.camera-angle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 4px;
}

.angle-icon {
    font-size: 14px;
}

.camera-help {
    color: #6b7280;
    font-size: 10px;
    line-height: 1.2;
}

/* MapLibre controls styling */
:deep(.maplibregl-ctrl-group) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.maplibregl-ctrl-group button) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    color: #374151;
    font-weight: 600;
    width: 36px;
    height: 36px;
    border: none;
}

:deep(.maplibregl-ctrl-group button:hover) {
    background: rgba(252, 76, 2, 0.1);
    color: #fc4c02;
}

:deep(.maplibregl-popup-content) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 12px;
    font-family: inherit;
}

:deep(.maplibregl-popup-anchor-bottom .maplibregl-popup-tip) {
    border-top-color: rgba(255, 255, 255, 0.95);
}

:deep(.maplibregl-popup-anchor-top .maplibregl-popup-tip) {
    border-bottom-color: rgba(255, 255, 255, 0.95);
}

:deep(.maplibregl-popup-anchor-left .maplibregl-popup-tip) {
    border-right-color: rgba(255, 255, 255, 0.95);
}

:deep(.maplibregl-popup-anchor-right .maplibregl-popup-tip) {
    border-left-color: rgba(255, 255, 1, 0.95);
}

:deep(.maplibregl-ctrl-scale) {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    padding: 4px 6px;
    font-size: 11px;
    color: #374151;
}

/* Cacher zoom et boussole sur mobile */
@media (max-width: 768px) {
    /* Cacher les boutons zoom */
    :deep(.maplibregl-ctrl-zoom-in),
    :deep(.maplibregl-ctrl-zoom-out) {
        display: none !important;
    }

    /* Cacher la boussole */
    :deep(.maplibregl-ctrl-compass) {
        display: none !important;
    }
}
</style>
