// src/components/RouteMapDrawer.tsx
import { useEffect, useRef, useState, useCallback } from 'react';
import Map from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Button } from './ui/button';
import { AlertCircle, Trash2, MapPin } from 'lucide-react';

// IMPORTANTE: Importar CSS en este orden
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWxxdWVtZWFwYXJhZG8iLCJhIjoiY21oNDNkd2l2MWhjcmFtcHUxeTVmcXJtZSJ9.3ei5bwvhC5R4Yrgud6OrWw';

interface RouteMapDrawerProps {
  onRouteCreated: (coordinates: [number, number][]) => void;
}

export const RouteMapDrawer = ({ onRouteCreated }: RouteMapDrawerProps) => {
  const mapRef = useRef<MapRef>(null);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawnCoordinates, setDrawnCoordinates] = useState<[number, number][]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: -108.9821,
    latitude: 25.7931,
    zoom: 12
  });

  // Inicializar herramientas de dibujo DESPUÉS de que el mapa esté cargado
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    const map = mapRef.current.getMap();

    // Crear instancia de MapboxDraw con configuración mejorada
    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        line_string: true,
        trash: true
      },
      defaultMode: 'draw_line_string',
      styles: [
        // Línea activa (mientras se dibuja)
        {
          'id': 'gl-draw-line',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3b82f6',
            'line-width': 4,
            'line-opacity': 0.8
          }
        },
        // Línea inactiva
        {
          'id': 'gl-draw-line-inactive',
          'type': 'line',
          'filter': ['all', ['==', '$type', 'LineString'], ['==', 'active', 'false']],
          'layout': {
            'line-cap': 'round',
            'line-join': 'round'
          },
          'paint': {
            'line-color': '#3b82f6',
            'line-width': 3
          }
        },
        // Halo de vértices (fondo blanco)
        {
          'id': 'gl-draw-polygon-and-line-vertex-halo-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 8,
            'circle-color': '#FFF'
          }
        },
        // Vértices
        {
          'id': 'gl-draw-polygon-and-line-vertex-active',
          'type': 'circle',
          'filter': ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
          'paint': {
            'circle-radius': 5,
            'circle-color': '#3b82f6'
          }
        },
        // Punto medio (para agregar vértices entre dos existentes)
        {
          'id': 'gl-draw-polygon-midpoint',
          'type': 'circle',
          'filter': ['all', ['==', '$type', 'Point'], ['==', 'meta', 'midpoint']],
          'paint': {
            'circle-radius': 4,
            'circle-color': '#ffa500'
          }
        }
      ]
    });

    // Agregar el control al mapa
    map.addControl(draw, 'top-left');
    drawRef.current = draw;

    console.log('✅ MapboxDraw inicializado');

    // Eventos de dibujo
    const onDrawCreate = (e: any) => {
      console.log('🎨 draw.create disparado', e);
      const data = draw.getAll();
      if (data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry.type === 'LineString') {
          const coords = feature.geometry.coordinates as [number, number][];
          console.log('📍 Coordenadas creadas:', coords.length, 'puntos');
          setDrawnCoordinates(coords);
          setIsDrawing(false);
        }
      }
    };

    const onDrawUpdate = (e: any) => {
      console.log('✏ draw.update disparado', e);
      const data = draw.getAll();
      if (data.features.length > 0) {
        const feature = data.features[0];
        if (feature.geometry.type === 'LineString') {
          const coords = feature.geometry.coordinates as [number, number][];
          console.log('📍 Coordenadas actualizadas:', coords.length, 'puntos');
          setDrawnCoordinates(coords);
        }
      }
    };

    const onDrawDelete = () => {
      console.log('🗑 draw.delete disparado');
      setDrawnCoordinates([]);
      setIsDrawing(false);
    };

    const onDrawModeChange = (e: any) => {
      console.log('🔄 draw.modechange disparado', e.mode);
      setIsDrawing(e.mode === 'draw_line_string');
    };

    map.on('draw.create', onDrawCreate);
    map.on('draw.update', onDrawUpdate);
    map.on('draw.delete', onDrawDelete);
    map.on('draw.modechange', onDrawModeChange);

    // Cleanup
    return () => {
      console.log('🧹 Limpiando MapboxDraw');
      if (drawRef.current && map) {
        map.off('draw.create', onDrawCreate);
        map.off('draw.update', onDrawUpdate);
        map.off('draw.delete', onDrawDelete);
        map.off('draw.modechange', onDrawModeChange);
        try {
          map.removeControl(draw);
        } catch (error) {
          console.error('Error al remover control:', error);
        }
      }
    };
  }, [mapLoaded]);

  const handleClear = useCallback(() => {
    if (drawRef.current) {
      drawRef.current.deleteAll();
      setDrawnCoordinates([]);
      setIsDrawing(false);
      console.log('🧹 Mapa limpiado');
    }
  }, []);

  const handleConfirmRoute = useCallback(() => {
    if (drawnCoordinates.length < 2) {
      alert('Debes dibujar al menos 2 puntos para crear una ruta');
      return;
    }
    console.log('✅ Confirmando ruta con', drawnCoordinates.length, 'puntos');
    onRouteCreated(drawnCoordinates);
  }, [drawnCoordinates, onRouteCreated]);

  const handleMapLoad = useCallback(() => {
    console.log('🗺 Mapa cargado');
    setMapLoaded(true);
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      {/* Barra de herramientas superior */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-semibold">Dibuja tu ruta en el mapa</h3>
              <p className="text-xs text-muted-foreground">
                Click en el mapa para agregar puntos. Doble click para finalizar.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              disabled={drawnCoordinates.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpiar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmRoute}
              disabled={drawnCoordinates.length < 2}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Usar esta ruta ({drawnCoordinates.length} puntos)
            </Button>
          </div>
        </div>

        {/* Indicadores de estado */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${isDrawing ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
            <span>{isDrawing ? 'Dibujando...' : 'Esperando'}</span>
          </div>
          <div className="text-muted-foreground">
            Puntos dibujados: <span className="font-semibold text-foreground">{drawnCoordinates.length}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${mapLoaded ? 'bg-blue-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span>{mapLoaded ? 'Mapa listo' : 'Cargando mapa...'}</span>
          </div>
        </div>

        {/* Instrucciones */}
        {drawnCoordinates.length === 0 && (
          <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-semibold mb-1">¿Cómo dibujar una ruta?</p>
              <ol className="list-decimal list-inside space-y-0.5">
                <li>Busca el ícono de línea (📏) en la esquina superior izquierda del mapa</li>
                <li>Click en el mapa para agregar el primer punto</li>
                <li>Continúa haciendo click para agregar más puntos</li>
                <li>Doble click o presiona Enter para finalizar</li>
                <li>Puedes mover los puntos arrastrándolos</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Mapa */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onLoad={handleMapLoad}
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Overlay de información */}
        {drawnCoordinates.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border border-gray-200 dark:border-gray-700">
            <div className="text-xs space-y-1">
              <p className="font-semibold">Información de la ruta:</p>
              <p>Puntos: {drawnCoordinates.length}</p>
              <p>
                Inicio: {drawnCoordinates[0]?.[1].toFixed(6)}, {drawnCoordinates[0]?.[0].toFixed(6)}
              </p>
              {drawnCoordinates.length > 1 && (
                <p>
                  Fin: {drawnCoordinates[drawnCoordinates.length - 1]?.[1].toFixed(6)},{' '}
                  {drawnCoordinates[drawnCoordinates.length - 1]?.[0].toFixed(6)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Mensaje de carga */}
        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <p className="text-sm font-medium">Cargando mapa...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};