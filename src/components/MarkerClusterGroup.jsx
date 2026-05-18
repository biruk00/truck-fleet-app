import React, { useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { LeafletContext, useLeafletContext } from '@react-leaflet/core';

const MarkerClusterGroup = ({ children, ...options }) => {
  const context = useLeafletContext();

  const clusterGroup = useMemo(() => {
    return L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 80,
      ...options,
    });
  }, [options]);

  useEffect(() => {
    const container = context.layerContainer || context.map;
    container.addLayer(clusterGroup);

    return () => {
      container.removeLayer(clusterGroup);
    };
  }, [context, clusterGroup]);

  return (
    <LeafletContext.Provider value={{ ...context, layerContainer: clusterGroup }}>
      {children}
    </LeafletContext.Provider>
  );
};

export default MarkerClusterGroup;
