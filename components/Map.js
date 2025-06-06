import { useEffect, useState, useRef } from "react";
import mapboxgl from "!mapbox-gl";

import { DataInfo } from "./DataInfo";
import { arraysAreEqual } from "../utils/utils";


export const Map = ({
  mapRef,
  data
}) => {

  const [init, setInit] = useState(false);
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const mapContainer = useRef(null);
  const map = mapRef.current;

  const [hovered, setHovered] = useState([]);

  useEffect(() => {
    if (mapRef.current) return;
    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [34.37684928423462, 31.425424890670165],
      zoom: 10,
      pitch: 0,
      minZoom: 0,
      antialias: true,
      fadeDuration: 0,
      preserveDrawingBuffer: true,
    });
    mapRef.current.on('load', () => {
      setInit(true);
    });
    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !init) return;
    Object.entries(data).forEach(([key, dataset]) => {
      const geojson = {
        type: "FeatureCollection",
        features: dataset.map((d) => ({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [d.fields.longitude, d.fields.latitude],
          },
          properties: d.fields,
        })),
      };
      let source;
      try {
        source = mapRef.current?.getSource(key);
      } catch {
      }
      if (source) {
        source.setData(geojson);
      } else {
        mapRef.current.addSource(key, {
          type: 'geojson',
          data: geojson,
        });
      }
      if (!mapRef.current.getLayer(key)) mapRef.current.addLayer({
        id: key,
        type: "circle",
        source: key,
        paint: {
          'circle-radius': 6,
          'circle-color': '#007cbf',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
        },
      });
    });

    mapRef.current.on('mousemove', (e) => {
      const features = mapRef.current.queryRenderedFeatures(e.point, {
        layers: Object.keys(data)
      });
      mapRef.current.getCanvas().style.cursor = features.length ? 'pointer' : '';
      if (!arraysAreEqual(hovered, features)) {
        setHovered(features);
      }
    });

  }, [JSON.stringify(data), hovered, init]);

  return [
    <DataInfo
      features={hovered}
    />,
    <div
      style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0 }}
      ref={mapContainer}
      className="map-container"
    />
  ];

};