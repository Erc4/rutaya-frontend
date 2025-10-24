// src/services/routesService.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';
import type { Coordinate } from './mapMatchingService';

// Interfaz para los datos de una ruta EN FIREBASE
export interface RouteData {
  nombre: string;
  descripcion: string;
  activo: number;
  waypoints: string; // String en formato "lon,lat;lon,lat;lon,lat"
  createdAt: Timestamp;
}

// Interfaz para crear una ruta (como la recibimos del componente)
export interface CreateRouteData {
  nombre: string;
  descripcion: string;
  activo: number;
  coordinates: Coordinate[]; // Array de [lon, lat] que viene del mapa
  distance?: number;
  duration?: number;
  profile?: string;
}

/**
 * Convierte coordenadas de formato [[lon, lat], [lon, lat]] a string "lon,lat;lon,lat"
 */
const convertCoordinatesToWaypointsString = (coordinates: Coordinate[]): string => {
  return coordinates
    .map(([longitude, latitude]) => `${longitude},${latitude}`)
    .join(';');
};

/**
 * Convierte string "lon,lat;lon,lat" de vuelta a formato [[lon, lat], [lon, lat]]
 * Para usarlo cuando leas datos de Firebase
 */
export const convertWaypointsStringToCoordinates = (waypoints: string): Coordinate[] => {
  return waypoints
    .split(';')
    .map(point => {
      const [lon, lat] = point.split(',').map(Number);
      return [lon, lat] as Coordinate;
    });
};

/**
 * Agregar una nueva ruta a Firebase con coordenadas
 * 
 * @param routeData - Datos de la ruta incluyendo coordenadas
 * @returns Resultado de la operación con ID del documento
 */
export const addRoute = async (routeData: CreateRouteData) => {
  try {
    // Validar que haya coordenadas
    if (!routeData.coordinates || routeData.coordinates.length < 2) {
      return {
        success: false,
        message: 'La ruta debe tener al menos 2 coordenadas'
      };
    }

    // Validar formato de coordenadas
    const isValidCoordinates = routeData.coordinates.every(
      coord => Array.isArray(coord) && 
               coord.length === 2 && 
               typeof coord[0] === 'number' && 
               typeof coord[1] === 'number'
    );

    if (!isValidCoordinates) {
      return {
        success: false,
        message: 'Formato de coordenadas inválido. Debe ser [[lon, lat], [lon, lat], ...]'
      };
    }

    // Validar rangos de coordenadas
    if (!validateCoordinates(routeData.coordinates)) {
      return {
        success: false,
        message: 'Las coordenadas están fuera de los rangos válidos'
      };
    }

    // ✅ CONVERTIR coordenadas a formato string "lon,lat;lon,lat"
    const waypointsString = convertCoordinatesToWaypointsString(routeData.coordinates);

    // Preparar datos para Firebase (SOLO los campos necesarios)
    const dataWithTimestamp: RouteData = {
      nombre: routeData.nombre,
      descripcion: routeData.descripcion,
      activo: routeData.activo,
      waypoints: waypointsString, // ✅ String en formato correcto
      createdAt: Timestamp.now()
    };

    console.log('📦 Datos preparados para Firebase:', {
      nombre: dataWithTimestamp.nombre,
      descripcion: dataWithTimestamp.descripcion,
      activo: dataWithTimestamp.activo,
      waypoints: waypointsString.substring(0, 100) + '...', // Mostrar primeros 100 caracteres
      coordinatesCount: routeData.coordinates.length
    });

    // Referencia a la colección 'rutas' en Firestore
    const routesCollection = collection(db, 'rutas');
    
    // Agregar el documento a Firestore
    const docRef = await addDoc(routesCollection, dataWithTimestamp);
    
    console.log('✅ Ruta agregada con ID:', docRef.id);
    console.log('📍 Waypoints guardados:', routeData.coordinates.length, 'puntos');
    
    return {
      success: true,
      id: docRef.id,
      message: 'Ruta agregada exitosamente',
      data: {
        id: docRef.id,
        coordinatesCount: routeData.coordinates.length,
        waypoints: waypointsString
      }
    };
  } catch (error) {
    console.error('❌ Error al agregar ruta:', error);
    
    // Manejo de errores específicos de Firebase
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return {
          success: false,
          message: 'Permisos denegados. Verifica las reglas de Firestore.'
        };
      }
      if (error.message.includes('network')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu internet.'
        };
      }
      
      // Mostrar el error real para debugging
      console.error('Error detallado:', error.message);
    }
    
    return {
      success: false,
      message: 'Error al agregar la ruta. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Valida que las coordenadas estén dentro de rangos válidos
 * 
 * @param coordinates - Array de coordenadas [lon, lat]
 * @returns true si son válidas, false si no
 */
export const validateCoordinates = (coordinates: Coordinate[]): boolean => {
  return coordinates.every(([lon, lat]) => {
    // Longitud debe estar entre -180 y 180
    // Latitud debe estar entre -90 y 90
    return lon >= -180 && lon <= 180 && lat >= -90 && lat <= 90;
  });
};

/**
 * Formatea coordenadas para mostrar en UI
 * 
 * @param coordinates - Array de coordenadas [lon, lat]
 * @returns String formateado
 */
export const formatCoordinates = (coordinates: Coordinate[]): string => {
  if (!coordinates || coordinates.length === 0) {
    return 'Sin coordenadas';
  }
  
  const [startLon, startLat] = coordinates[0];
  const [endLon, endLat] = coordinates[coordinates.length - 1];
  
  return `Desde (${startLat.toFixed(4)}, ${startLon.toFixed(4)}) hasta (${endLat.toFixed(4)}, ${endLon.toFixed(4)})`;
};

/**
 * Convierte distancia de metros a formato legible
 * 
 * @param meters - Distancia en metros
 * @returns String formateado (km o m)
 */
export const formatDistance = (meters: number): string => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`;
  }
  return `${Math.round(meters)} m`;
};

/**
 * Convierte duración de segundos a formato legible
 * 
 * @param seconds - Duración en segundos
 * @returns String formateado (horas, minutos, segundos)
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};