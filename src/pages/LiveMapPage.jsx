import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Target, Layers, Map as MapIcon, Loader, Search } from 'lucide-react';
import MarkerClusterGroup from '../components/MarkerClusterGroup';

const statusColors = {
  active: "#22c55e",
  idle: "#f59e0b",
  maintenance: "#ef4444",
  offline: "#94a3b8",
  Loading: "#3b82f6",
  Unloading: "#8b5cf6",
  Ongoing: "#10b981",
  Oncoming: "#f97316",
  Parked: "#64748b",
  Garage: "#475569",
  Node: "#475569"
};

// Auto-center map on trucks
function MapController({ trucks }) {
  const map = useMap();
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    window.leafletMap = map;
    const validTrucks = trucks.filter(t => t && typeof t.latitude === 'number' && typeof t.longitude === 'number');
    if (validTrucks.length > 0 && !hasCentered) {
      const bounds = L.latLngBounds(validTrucks.map(t => [t.latitude, t.longitude]));
      map.fitBounds(bounds, { padding: [50, 50] });
      setHasCentered(true);
    }
  }, [trucks, map, hasCentered]);

  return null;
}

export default function LiveMapPage() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSatellite, setIsSatellite] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("total");

  useEffect(() => {
    fetchTrucks();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTrucks, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchTrucks = async () => {
    try {
      const { data, error } = await supabase.from('trucks').select('*');
      if (error) throw error;
      
      // Since the current database schema lacks latitude/longitude, 
      // we map the trucks to distinct, valid coordinates around Addis Ababa
      const defaultLocations = [
        { lat: 9.032, lng: 38.748 }, // Central
        { lat: 9.010, lng: 38.761 }, // Industrial Zone
        { lat: 9.045, lng: 38.770 }, // Garage
        { lat: 8.990, lng: 38.780 }, // Outskirts
        { lat: 9.020, lng: 38.800 }, // Warehouse
      ];

      const trucksWithCoords = (data || []).map((truck, index) => {
        const loc = defaultLocations[index % defaultLocations.length];
        return {
          ...truck,
          latitude: truck.latitude || loc.lat,
          longitude: truck.longitude || loc.lng,
          speed: truck.speed || (index % 3 === 0 ? 45 : 0) // Mock speed for some
        };
      });

      setTrucks(trucksWithCoords);
    } catch (err) {
      console.error('Error fetching trucks for map:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrucks = useMemo(() => {
    let result = trucks;
    
    // Status Filter
    if (activeFilter === "active") result = result.filter(t => t.status === "Ongoing" || t.status === "active");
    if (activeFilter === "idle") result = result.filter(t => t.status === "Parked" || t.status === "idle");
    if (activeFilter === "offline") result = result.filter(t => t.status === "offline" || t.status === "Node");
    
    // Search Filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        (t.plate_no && t.plate_no.toLowerCase().includes(q)) ||
        (t.driver && t.driver.toLowerCase().includes(q)) ||
        (t.current_location && t.current_location.toLowerCase().includes(q))
      );
    }
    return result;
  }, [trucks, activeFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: trucks.length,
      active: trucks.filter(t => t.status === "Ongoing" || t.status === "active").length,
      idle: trucks.filter(t => t.status === "Parked" || t.status === "idle").length,
      offline: trucks.filter(t => t.status === "offline" || t.status === "Node").length,
    };
  }, [trucks]);

  if (loading && trucks.length === 0) {
    return (
      <div className="w-full h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-900 animate-pulse rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200 dark:border-slate-800">
        <Loader className="w-10 h-10 text-orange-500 animate-spin" />
        <span className="font-bold uppercase tracking-widest text-sm">Initializing Live Map...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-140px)] sm:h-[calc(100vh-100px)] rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700">
      
      {/* ── MAP OVERLAY CONTROLS ── */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-[1000] flex flex-col gap-2 pointer-events-none">
        
        {/* Status Filters */}
        <div className="flex flex-col sm:flex-row gap-2 pointer-events-auto">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col gap-2 min-w-[160px]">
            <button 
              onClick={() => setActiveFilter("total")}
              className={`flex items-center gap-3 w-full p-2 rounded-xl transition-all ${activeFilter === "total" ? 'bg-slate-100 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${filteredTrucks.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Fleet Status</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white tracking-tight leading-none">{filteredTrucks.length} / {trucks.length} Vehicles</span>
              </div>
            </button>
            
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setActiveFilter(activeFilter === "active" ? "total" : "active")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${activeFilter === "active" ? 'bg-emerald-50 dark:bg-emerald-900/30 shadow-sm border border-emerald-200 dark:border-emerald-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} 
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className={`text-[11px] font-black ${activeFilter === "active" ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>{stats.active}</span>
              </button>
              <button 
                onClick={() => setActiveFilter(activeFilter === "idle" ? "total" : "idle")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${activeFilter === "idle" ? 'bg-amber-50 dark:bg-amber-900/30 shadow-sm border border-amber-200 dark:border-amber-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} 
              >
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                <span className={`text-[11px] font-black ${activeFilter === "idle" ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>{stats.idle}</span>
              </button>
              <button 
                onClick={() => setActiveFilter(activeFilter === "offline" ? "total" : "offline")}
                className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg transition-all ${activeFilter === "offline" ? 'bg-slate-100 dark:bg-slate-800 shadow-sm border border-slate-300 dark:border-slate-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`} 
              >
                <div className="w-1.5 h-1.5 rounded-full bg-slate-500"></div>
                <span className={`text-[11px] font-black ${activeFilter === "offline" ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>{stats.offline}</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group w-full sm:w-64">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input 
              type="text"
              placeholder="Search plate, driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all text-sm font-bold text-slate-800 dark:text-white w-full"
            />
          </div>
        </div>
      </div>

      {/* ── FLOATING TOOLBOX (Right side) ── */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-3 pointer-events-auto">
        <button 
          onClick={() => {
            const map = window.leafletMap;
            const validTrucks = trucks.filter(t => t && typeof t.latitude === 'number' && typeof t.longitude === 'number');
            if (map && validTrucks.length > 0) {
              const bounds = L.latLngBounds(validTrucks.map(t => [t.latitude, t.longitude]));
              map.fitBounds(bounds, { padding: [50, 50] });
            }
          }}
          className="w-12 h-12 rounded-2xl bg-white/90 dark:bg-slate-900/90 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-orange-500 shadow-2xl transition-all border border-slate-200 dark:border-slate-700 backdrop-blur-md"
          title="Recenter on Fleet"
        >
          <Target size={22} />
        </button>
        
        <button 
          onClick={() => setIsSatellite(!isSatellite)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 border ${isSatellite ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md'}`}
          title="Toggle Satellite View"
        >
          {isSatellite ? <MapIcon size={22} /> : <Layers size={22} />}
        </button>
      </div>

      {/* ── MAP CONTAINER ── */}
      <MapContainer 
        center={[9.012, 38.751]} // Default to Addis Ababa
        zoom={12} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution={isSatellite ? '&copy; Google' : '&copy; OpenStreetMap'}
          url={isSatellite 
            ? "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}" 
            : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
        />

        <MapController trucks={filteredTrucks} />

        <MarkerClusterGroup>
          {filteredTrucks.filter(t => t && typeof t.latitude === 'number' && typeof t.longitude === 'number').map((truck) => (
            <Marker 
              key={truck.id} 
              position={[truck.latitude, truck.longitude]} 
              icon={L.divIcon({
                className: "custom-div-icon",
                html: `
                  <div class="relative flex flex-col items-center">
                    <div class="mb-1 bg-white px-2 py-0.5 rounded shadow-md border border-slate-200 text-[10px] font-black whitespace-nowrap text-slate-800 flex items-center gap-1 z-[1001]">
                        <span>${truck.plate_no}</span>
                    </div>
                    <div class="relative" style="transform: rotate(${truck.course || 0}deg);">
                      ${(truck.speed || 0) > 5 ? 
                        `<div class="w-5 h-7 bg-white rounded-full flex items-center justify-center shadow-lg border-2" style="border-color: ${statusColors[truck.status] || '#94a3b8'}">
                           <div class="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[8px] mb-1" style="border-bottom-color: ${statusColors[truck.status] || '#94a3b8'}"></div>
                         </div>` :
                        `<div class="w-5 h-5 bg-white rounded shadow-md border-2 flex items-center justify-center" style="border-color: ${statusColors[truck.status] || '#94a3b8'}; border-radius: 4px;">
                           <div class="w-2 h-2 rounded-sm" style="background: ${statusColors[truck.status] || '#94a3b8'}"></div>
                         </div>`
                      }
                    </div>
                  </div>
                `,
                iconSize: [60, 60],
                iconAnchor: [30, 35]
              })}
            >
              <Popup className="custom-popup min-w-[240px]">
                <div className="p-1">
                  <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">License Plate</span>
                        <strong className="text-base font-black text-slate-900 leading-tight">{truck.plate_no}</strong>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-lg capitalize text-white font-black shadow-sm" style={{backgroundColor: statusColors[truck.status] || '#94a3b8'}}>
                      {truck.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-tight">Driver</span>
                        <span className="font-bold text-slate-800">{truck.driver || 'Unassigned'}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Speed</span>
                        <span className="font-black text-blue-600">{truck.speed || 0} km/h</span>
                    </div>
                    {truck.current_location && (
                      <div className="flex items-start gap-1 p-2 bg-orange-50/50 rounded-lg border border-orange-100 mt-1">
                          <div className="text-[10px] text-orange-600 font-bold uppercase shrink-0 pt-0.5 tracking-tighter">LOC:</div>
                          <div className="text-[10px] font-bold text-orange-900 line-clamp-2 leading-tight">{truck.current_location}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
