'use client';

import { Layer, Map, Source } from '@vis.gl/react-maplibre';
import { FeatureCollection } from 'geojson';
import 'maplibre-gl/dist/maplibre-gl.css';

interface MapLibreProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  height?: number;
}

export function MapLibre({ latitude, longitude, zoom = 13 }: MapLibreProps) {
  const geojson: FeatureCollection = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [longitude, latitude] },
        properties: {
          title: 'Dakar surf',
          description: 'Dakar surf spot',
        },
      },
    ],
  };
  const layerStyle: any = {
    id: 'point',
    type: 'circle',
    paint: {
      'circle-radius': 10,
      'circle-color': '#b200bf',
    },
  };
  return (
    <Map
      initialViewState={{ longitude, latitude, zoom }}
      mapStyle="https://api.maptiler.com/maps/aquarelle/style.json?key=sx7B0DdcZtws03AXarHk"
      style={{ width: 600, height: 400 }}
      attributionControl={false}
    >
      <Source id="my-data" type="geojson" data={geojson}>
        <Layer {...layerStyle} />
      </Source>
    </Map>
  );
}
