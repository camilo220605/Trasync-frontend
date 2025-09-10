import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Bus,
  MapPin,
  Navigation,
  Route,
  Plus,
  X,
  Home,
  Play,
  Square,
  Wrench,
  Users,
  Zap,
  Clock,
  Activity,
  ZoomIn,
  ZoomOut,
  Locate,
  Map as MapIcon,
  Info,
  Target,
  AlertCircle
} from 'lucide-react';

// Iconos personalizados para diferentes tipos de marcadores
const createCustomIcon = (color, iconHtml) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 14px;">${iconHtml}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const stopIcon = createCustomIcon('#EF4444', '<svg width="16" height="16" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>');

// Simulación de datos de buses en tiempo real
const generateMockBuses = () => {
  return [
    {
      id: 'bus-001',
      route: 'Ruta 1: Centro - Norte',
      driver: 'Juan Pérez',
      lat: 4.7110,
      lng: -74.0721,
      speed: 25,
      passengers: 23,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 45
    },
    {
      id: 'bus-002',
      route: 'Ruta 2: Sur - Occidente',
      driver: 'María González',
      lat: 4.6097,
      lng: -74.0817,
      speed: 18,
      passengers: 31,
      capacity: 40,
      status: 'en_ruta',
      lastUpdate: new Date(),
      direction: 120
    },
    {
      id: 'bus-003',
      route: 'Ruta 3: Oriente - Centro',
      driver: 'Carlos Rodríguez',
      lat: 4.6486,
      lng: -74.0639,
      speed: 0,
      passengers: 8,
      capacity: 35,
      status: 'parada',
      lastUpdate: new Date(),
      direction: 0
    }
  ];
};

// Simulación de paradas de bus
const mockBusStops = [
  { id: 'stop-001', name: 'Terminal Norte', lat: 4.7850, lng: -74.0450, routes: ['Ruta 1', 'Ruta 3'] },
  { id: 'stop-002', name: 'Plaza Bolívar', lat: 4.5981, lng: -74.0758, routes: ['Ruta 1', 'Ruta 2'] },
  { id: 'stop-003', name: 'Centro Comercial', lat: 4.6601, lng: -74.0547, routes: ['Ruta 2', 'Ruta 3'] },
  { id: 'stop-004', name: 'Universidad Nacional', lat: 4.6365, lng: -74.0847, routes: ['Ruta 1'] },
  { id: 'stop-005', name: 'Hospital San Juan', lat: 4.6280, lng: -74.0631, routes: ['Ruta 2'] }
];

// Simulación de rutas predefinidas con nueva paleta de colores
const mockRoutes = [
  {
    id: 'route-001',
    name: 'Ruta 1: Centro - Norte',
    color: '#6366f1', // Indigo
    coordinates: [
      [4.5981, -74.0758],
      [4.6280, -74.0631],
      [4.6601, -74.0547],
      [4.7110, -74.0721],
      [4.7850, -74.0450]
    ],
    distance: '15.2 km',
    estimatedTime: '45 min',
    active: true
  },
  {
    id: 'route-002',
    name: 'Ruta 2: Sur - Occidente',
    color: '#06b6d4', // Cyan
    coordinates: [
      [4.5700, -74.0900],
      [4.5981, -74.0758],
      [4.6097, -74.0817],
      [4.6280, -74.0631],
      [4.6500, -74.1200]
    ],
    distance: '18.7 km',
    estimatedTime: '55 min',
    active: true
  },
  {
    id: 'route-003',
    name: 'Ruta 3: Oriente - Centro',
    color: '#8b5cf6', // Violet
    coordinates: [
      [4.6800, -74.0300],
      [4.6486, -74.0639],
      [4.6365, -74.0847],
      [4.6001, -74.0700],
    ],
    distance: '12.5 km',
    estimatedTime: '35 min',
    active: false
  }
];

// Componente para actualizar posición de buses
const BusUpdater = ({ buses, setBuses }) => {
  useEffect(() => {
    const interval = setInterval(() => {
      setBuses(prevBuses =>
        prevBuses.map(bus => {
          if (bus.status === 'en_ruta' && bus.speed > 0) {
            const deltaLat = (Math.random() - 0.5) * 0.001;
            const deltaLng = (Math.random() - 0.5) * 0.001;

            return {
              ...bus,
              lat: bus.lat + deltaLat,
              lng: bus.lng + deltaLng,
              lastUpdate: new Date(),
              speed: Math.max(0, bus.speed + (Math.random() - 0.5) * 5),
              passengers: Math.max(0, Math.min(bus.capacity, bus.passengers + Math.floor((Math.random() - 0.5) * 3)))
            };
          }
          return bus;
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [setBuses]);

  return null;
};

// Componente para manejar clics en el mapa
const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

// Componente para controlar el mapa
const MapControl = ({ center, zoom }) => {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);

  return null;
};

const InteractiveMap = () => {
  const [buses, setBuses] = useState(generateMockBuses());
  const [selectedBus, setSelectedBus] = useState(null);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showStops, setShowStops] = useState(true);
  const [showBuses, setShowBuses] = useState(true);
  const [mapCenter, setMapCenter] = useState([4.6482, -74.0648]);
  const [mapZoom, setMapZoom] = useState(11);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [newMarkers, setNewMarkers] = useState([]);
  const [isAddingStop, setIsAddingStop] = useState(false);

  // Colombia bounds para restringir el mapa
  const colombiaBounds = [
    [-4.2276, -81.8317],
    [15.5138, -66.8694]
  ];

  const handleBusClick = (bus) => {
    setSelectedBus(bus);
    setMapCenter([bus.lat, bus.lng]);
    setMapZoom(15);
  };

  const handleRouteSelect = (route) => {
    setSelectedRoute(route);
    if (route && route.coordinates.length > 0) {
      const lats = route.coordinates.map(coord => coord[0]);
      const lngs = route.coordinates.map(coord => coord[1]);
      const bounds = [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
      setMapCenter([(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]);
      setMapZoom(12);
    }
  };

  const startTracking = (bus) => {
    setIsTracking(true);
    setSelectedBus(bus);

    const trackingInterval = setInterval(() => {
      setBuses(currentBuses => {
        const trackedBus = currentBuses.find(b => b.id === bus.id);
        if (trackedBus) {
          setMapCenter([trackedBus.lat, trackedBus.lng]);
        }
        return currentBuses;
      });
    }, 2000);

    setTimeout(() => {
      setIsTracking(false);
      clearInterval(trackingInterval);
    }, 30000);
  };

  const handleMapClick = (latlng) => {
    if (isAddingStop) {
      const newStop = {
        id: `new-stop-${Date.now()}`,
        name: `Nueva Parada ${newMarkers.length + 1}`,
        lat: latlng.lat,
        lng: latlng.lng,
        routes: [],
        isNew: true
      };
      setNewMarkers([...newMarkers, newStop]);
      setIsAddingStop(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_ruta': return '#10b981';
      case 'parada': return '#ef4444';
      case 'mantenimiento': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'en_ruta': return 'En Ruta';
      case 'parada': return 'En Parada';
      case 'mantenimiento': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'en_ruta': return <Play className="w-3 h-3" />;
      case 'parada': return <Square className="w-3 h-3" />;
      case 'mantenimiento': return <Wrench className="w-3 h-3" />;
      default: return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="w-full h-screen flex flex-col bg-gray-100">
      {/* Header de Control */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Bus className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Sistema de Rutas TransSync</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">

              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>En tiempo real</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filtros de visualización */}
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showBuses}
                  onChange={(e) => setShowBuses(e.target.checked)}
                  className="rounded"
                />
                <Bus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                Buses
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showRoutes}
                  onChange={(e) => setShowRoutes(e.target.checked)}
                  className="rounded"
                />
                <Route className="w-4 h-4" />
                Rutas
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={showStops}
                  onChange={(e) => setShowStops(e.target.checked)}
                  className="rounded"
                />
                <MapPin className="w-4 h-4" />
                Paradas
              </label>
            </div>

            {/* Botones de acción */}
            <button
              onClick={() => setIsAddingStop(!isAddingStop)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1 ${isAddingStop
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {isAddingStop ? (
                <>
                  <X className="w-4 h-4" />
                  Cancelar
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Agregar Parada
                </>
              )}
            </button>

            <button
              onClick={() => {
                setMapCenter([4.6482, -74.0648]);
                setMapZoom(11);
                setSelectedRoute(null);
                setSelectedBus(null);
              }}
              className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              Vista General
            </button>
          </div>
        </div>

        {isAddingStop && (
          <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Haz clic en el mapa donde quieres agregar una nueva parada
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel Lateral */}
        <div className="w-80 bg-white dark:bg-gray-900 shadow-lg overflow-y-auto flex-shrink-0">

          {/* Información del bus seleccionado */}
          {selectedBus && (
            <div className="p-4 bg-blue-50 border-b">
              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">{selectedBus.route}</h3>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span><strong>Conductor:</strong> {selectedBus.driver}</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedBus.status)}
                  <span><strong>Estado:</strong></span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${selectedBus.status === 'en_ruta' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {getStatusText(selectedBus.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  <span><strong>Velocidad:</strong> {selectedBus.speed} km/h</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span><strong>Pasajeros:</strong> {selectedBus.passengers}/{selectedBus.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span><strong>Última actualización:</strong> {selectedBus.lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => startTracking(selectedBus)}
                  disabled={isTracking}
                  className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center gap-1"
                >
                  <Target className="w-3 h-3" />
                  {isTracking ? 'Siguiendo...' : 'Seguir Bus'}
                </button>
                <button
                  onClick={() => setSelectedBus(null)}
                  className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Cerrar
                </button>
              </div>
            </div>
          )}

          {/* Lista de Buses */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Bus className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">
                Buses Activos ({buses.length})
              </h3>
            </div>
            <div className="space-y-2">
              {buses.map(bus => (
                <div
                  key={bus.id}
                  onClick={() => handleBusClick(bus)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${selectedBus?.id === bus.id
                    ? 'bg-blue-100 dark:bg-blue-900 border-2 border-blue-300 dark:border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {bus.route}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        {bus.driver}
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div
                        className={`w-3 h-3 rounded-full ${bus.status === 'en_ruta' ? 'bg-green-400' : 'bg-red-400'
                          }`}
                      ></div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Zap className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        {bus.speed} km/h
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                      {bus.passengers}/{bus.capacity}
                    </span>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(bus.status)}
                      {getStatusText(bus.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Lista de Rutas */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <Route className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Rutas Disponibles</h3>
            </div>
            <div className="space-y-2">
              {mockRoutes.map(route => (
                <div
                  key={route.id}
                  onClick={() => handleRouteSelect(route)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors border ${selectedRoute?.id === route.id
                    ? 'bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600'
                    : 'bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: route.color }}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 dark:text-gray-100">
                        {route.name}
                      </h4>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="flex items-center gap-1">
                          <MapIcon className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          {route.distance}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                          {route.estimatedTime}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${route.active ? 'bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
                        }`}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>


          {/* Estadísticas */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              <h3 className="font-bold text-gray-900 dark:text-gray-100">Estadísticas en Tiempo Real</h3>
            </div>
            <div className="space-y-3">
              <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {buses.filter(b => b.status === 'en_ruta').length}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">Buses en Ruta</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {buses.reduce((total, bus) => total + bus.passengers, 0)}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">Pasajeros Totales</div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">
                <div className="bg-purple-50 dark:bg-purple-900 p-3 rounded-lg">

                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Velocidad Promedio (km/h)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mapa Principal */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            className="h-full w-full"
            maxBounds={colombiaBounds}
            maxBoundsViscosity={0.8}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapControl center={mapCenter} zoom={mapZoom} />
            <MapClickHandler onMapClick={handleMapClick} />
            <BusUpdater buses={buses} setBuses={setBuses} />

            {/* Rutas */}
            {showRoutes && mockRoutes.map(route => (
              <Polyline
                key={route.id}
                positions={route.coordinates}
                color={route.color}
                weight={selectedRoute?.id === route.id ? 6 : 4}
                opacity={route.active ? 0.8 : 0.4}
                dashArray={route.active ? null : "10, 10"}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-bold">{route.name}</h3>
                    <div className="flex items-center gap-2 justify-center text-sm mt-1">
                      <span className="flex items-center gap-1">
                        <MapIcon className="w-3 h-3" />
                        {route.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {route.estimatedTime}
                      </span>
                    </div>
                    <p className="text-xs mt-1 flex items-center gap-1 justify-center">
                      Estado: {route.active ? (
                        <span className="flex items-center gap-1 text-green-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Activa
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Inactiva
                        </span>
                      )}
                    </p>
                  </div>
                </Popup>
              </Polyline>
            ))}

            {/* Paradas de Bus */}
            {showStops && mockBusStops.map(stop => (
              <Marker
                key={stop.id}
                position={[stop.lat, stop.lng]}
                icon={stopIcon}
              >
                <Popup>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold">{stop.name}</h3>
                    </div>
                    <p className="text-sm">Rutas que pasan:</p>
                    <ul className="text-xs list-disc list-inside">
                      {stop.routes.map((route, idx) => (
                        <li key={idx}>{route}</li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Nuevas paradas agregadas */}
            {newMarkers.map(marker => (
              <Marker
                key={marker.id}
                position={[marker.lat, marker.lng]}
                icon={createCustomIcon('#f59e0b', '<svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="m12 1 3 6 6 3-6 3-3 6-3-6-6-3 6-3z"/></svg>')}
              >
                <Popup>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-orange-600" />
                      <h3 className="font-bold">{marker.name}</h3>
                    </div>
                    <p className="text-sm">Nueva parada agregada</p>
                    <button
                      onClick={() => setNewMarkers(prev => prev.filter(m => m.id !== marker.id))}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs mt-2 hover:bg-red-600 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Buses */}
            {showBuses && buses.map(bus => (
              <Marker
                key={bus.id}
                position={[bus.lat, bus.lng]}
                icon={L.divIcon({
                  html: `<div style="
                    background-color: ${getStatusColor(bus.status)};
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    transform: rotate(${bus.direction}deg);
                    ${isTracking && selectedBus?.id === bus.id ? 'animation: pulse 1s infinite;' : ''}
                  "><svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" stroke-width="2"><path d="M8 6v6h8V6l2 2v8a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8l2-2Z"/><path d="M16 16v2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2"/></svg></div>
                  <style>
                    @keyframes pulse {
                      0% { transform: scale(1) rotate(${bus.direction}deg); }
                      50% { transform: scale(1.1) rotate(${bus.direction}deg); }
                      100% { transform: scale(1) rotate(${bus.direction}deg); }
                    }
                  </style>`,
                  iconSize: [35, 35],
                  iconAnchor: [17, 17]
                })}
                eventHandlers={{
                  click: () => handleBusClick(bus)
                }}
              >
                <Popup>
                  <div className="min-w-[200px] text-gray-800 dark:text-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h3 className="font-bold text-blue-900 dark:text-blue-300">
                        {bus.route}
                      </h3>
                    </div>
                    <div className="mt-2 space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Navigation className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Conductor:</strong> {bus.driver}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(bus.status)}
                        <span>
                          <strong>Estado:</strong>
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${bus.status === "en_ruta"
                            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
                            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
                            }`}
                        >
                          {getStatusText(bus.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Velocidad:</strong> {bus.speed} km/h
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Ocupación:</strong> {bus.passengers}/{bus.capacity}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(bus.passengers / bus.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                        <span>
                          <strong>Última actualización:</strong>{" "}
                          {bus.lastUpdate.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => startTracking(bus)}
                        className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                      >
                        <Target className="w-3 h-3" />
                        Seguir
                      </button>
                      <button
                        onClick={() => setSelectedBus(bus)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors flex items-center gap-1"
                      >
                        <Info className="w-3 h-3" />
                        Detalles
                      </button>
                    </div>
                  </div>
                </Popup>

              </Marker>
            ))}
          </MapContainer>

          {/* Indicador de tracking */}
          {isTracking && selectedBus && (
            <div className="absolute top-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-[1000]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <Target className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Siguiendo: {selectedBus.route}
                </span>
              </div>
            </div>
          )}

          {/* Controles de zoom y ubicación */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
            <button
              onClick={() => setMapZoom(prev => Math.min(prev + 1, 18))}
              className="bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMapZoom(prev => Math.max(prev - 1, 3))}
              className="bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                navigator.geolocation?.getCurrentPosition(
                  (position) => {
                    setMapCenter([position.coords.latitude, position.coords.longitude]);
                    setMapZoom(15);
                  },
                  () => {
                    setMapCenter([4.6482, -74.0648]);
                    setMapZoom(12);
                  }
                );
              }}
              className="bg-blue-500 text-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
            >
              <Locate className="w-5 h-5" />
            </button>
          </div>

          {/* Leyenda del mapa */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <MapIcon className="w-4 h-4 text-gray-700" />
              <h4 className="font-bold text-sm">Leyenda</h4>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <Bus className="w-3 h-3" />
                </div>
                <span>Bus en ruta</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <Bus className="w-3 h-3" />
                </div>
                <span>Bus en parada</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">
                  <MapPin className="w-3 h-3" />
                </div>
                <span>Parada de bus</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1" style={{ backgroundColor: '#6366f1' }}></div>
                <span>Ruta activa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 border-b border-gray-400 border-dashed"></div>
                <span>Ruta inactiva</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información adicional */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            Última actualización: {new Date().toLocaleTimeString()}
          </div>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <Bus className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              {buses.length} buses activos
            </span>
            <span className="flex items-center gap-1">
              <Route className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              {mockRoutes.filter(r => r.active).length} rutas operativas
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-600 dark:text-gray-400" />
              {mockBusStops.length + newMarkers.length} paradas registradas
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-gray-600 dark:text-gray-400" />
            Sistema en tiempo real
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;