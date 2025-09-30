<template>
    <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Props
interface Props {
    initialCenter?: [number, number];
    initialZoom?: number;
}

const props = withDefaults(defineProps<Props>(), {
    initialCenter: () => [46.603354, 1.888334], // Centre de la France
    initialZoom: 6,
});

// Reactive state
const mapContainer = ref<HTMLElement>();
let map: L.Map | null = null;
let currentTrack: L.Polyline | null = null;

// Map layers
const baseLayers = {
    OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        },
    ),
    OpenTopoMap: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
            attribution:
                'Map data: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: © <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
            maxZoom: 17,
        },
    ),
    Terrain: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}",
        {
            attribution:
                'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer">ArcGIS</a>',
            maxZoom: 13,
        },
    ),
};

// Methods
const initializeMap = () => {
    if (!mapContainer.value) return;

    // Fix Leaflet default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    // Create map
    map = L.map(mapContainer.value, {
        center: props.initialCenter,
        zoom: props.initialZoom,
        zoomControl: false,
    });

    // Add default layer (OpenTopoMap for relief)
    baseLayers["OpenTopoMap"].addTo(map);

    // Add zoom control to top-left
    L.control
        .zoom({
            position: "topleft",
        })
        .addTo(map);

    // Add layer control
    L.control
        .layers(
            baseLayers,
            {},
            {
                position: "bottomright",
            },
        )
        .addTo(map);

    // Add scale control
    L.control
        .scale({
            position: "bottomleft",
        })
        .addTo(map);
};

const destroyMap = () => {
    if (map) {
        map.remove();
        map = null;
    }
};

// Expose methods to parent component
const getMap = () => map;

const setView = (center: [number, number], zoom?: number) => {
    if (map) {
        map.setView(center, zoom || map.getZoom());
    }
};

const fitBounds = (
    bounds: L.LatLngBoundsExpression,
    options?: L.FitBoundsOptions,
) => {
    if (map) {
        map.fitBounds(bounds, options);
    }
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
    } = {},
) => {
    if (!map || coordinates.length === 0) return;

    // Remove existing track
    removeCurrentTrack();

    // Default options
    const trackOptions = {
        color: options.color || "#FC4C02",
        weight: options.weight || 3,
        opacity: options.opacity || 0.8,
        lineCap: "round" as const,
        lineJoin: "round" as const,
    };

    // Create polyline
    currentTrack = L.polyline(coordinates, trackOptions);

    // Add popup with activity info if provided
    if (options.activityName) {
        const popupContent = `
            <div style="text-align: center; font-family: inherit;">
                <strong style="color: #2d3748;">${options.activityName}</strong>
                ${options.activityType ? `<br><small style="color: #718096;">${options.activityType}</small>` : ""}
            </div>
        `;
        currentTrack.bindPopup(popupContent);
    }

    // Add to map
    currentTrack.addTo(map);

    // Fit map to track bounds with padding
    const bounds = currentTrack.getBounds();
    map.fitBounds(bounds, { padding: [20, 20] });

    return currentTrack;
};

/**
 * Remove current track from map
 */
const removeCurrentTrack = () => {
    if (currentTrack && map) {
        map.removeLayer(currentTrack);
        currentTrack = null;
    }
};

/**
 * Add start/end markers to track
 */
const addTrackMarkers = (
    coordinates: [number, number][],
    activityName?: string,
) => {
    if (!map || coordinates.length === 0) return;

    const startCoord = coordinates[0];
    const endCoord = coordinates[coordinates.length - 1];

    if (!startCoord || !endCoord) return;

    // Custom icons
    const startIcon = L.divIcon({
        className: "track-marker start-marker",
        html: '<div style="background: #10B981; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">S</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    const endIcon = L.divIcon({
        className: "track-marker end-marker",
        html: '<div style="background: #EF4444; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">F</div>',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

    // Add markers
    const startMarker = L.marker(startCoord, { icon: startIcon }).addTo(map);
    const endMarker = L.marker(endCoord, { icon: endIcon }).addTo(map);

    // Add popups
    startMarker.bindPopup(
        `<strong>Départ</strong>${activityName ? `<br>${activityName}` : ""}`,
    );
    endMarker.bindPopup(
        `<strong>Arrivée</strong>${activityName ? `<br>${activityName}` : ""}`,
    );

    return { startMarker, endMarker };
};

/**
 * Clear all tracks and markers
 */
const clearMap = () => {
    removeCurrentTrack();
    // Note: markers are automatically removed when track is removed in our case
    // If we store markers separately, we'd remove them here too
};

defineExpose({
    getMap,
    setView,
    fitBounds,
    addTrack,
    removeCurrentTrack,
    addTrackMarkers,
    clearMap,
});

// Lifecycle
onMounted(() => {
    initializeMap();
});

onUnmounted(() => {
    destroyMap();
});
</script>

<style scoped>
.map-container {
    width: 100%;
    height: 100%;
    z-index: 0;
}

/* Fix Leaflet controls styling */
:deep(.leaflet-control-container) {
    font-family: inherit;
}

:deep(.leaflet-control-layers) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-control-zoom) {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border: 1px solid rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-control-zoom a) {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    color: #374151;
    font-weight: 600;
    width: 36px;
    height: 36px;
    line-height: 36px;
    border: none;
}

:deep(.leaflet-control-zoom a:hover) {
    background: rgba(252, 76, 2, 0.1);
    color: #fc4c02;
}

:deep(.leaflet-control-scale) {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    font-size: 11px;
}
</style>
