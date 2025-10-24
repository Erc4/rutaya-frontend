// src/services/mapMatchingService.ts

// Token de Mapbox - DEBES REEMPLAZARLO
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZWxxdWVtZWFwYXJhZG8iLCJhIjoiY21oNDNkd2l2MWhjcmFtcHUxeTVmcXJtZSJ9.3ei5bwvhC5R4Yrgud6OrWw';

// Interfaz para las coordenadas
export type Coordinate = [number, number]; // [longitude, latitude]

// Interfaz para la respuesta de Map Matching API
interface MapMatchingResponse {
  code: string;
  matchings: Array<{
    geometry: {
      coordinates: Coordinate[];
      type: string;
    };
    legs: any[];
    weight: number;
    duration: number;
    distance: number;
    confidence: number;
  }>;
  tracepoints: any[];
}

// Interfaz para el resultado procesado
export interface MatchedRoute {
  coordinates: Coordinate[];
  distance: number; // en metros
  duration: number; // en segundos
  confidence: number; // 0-1
}

/**
 * Llama a la Map Matching API de Mapbox para ajustar coordenadas GPS a calles reales
 * 
 * @param coordinates - Array de coordenadas [longitude, latitude]
 * @param profile - Perfil de ruta: 'driving', 'walking', 'cycling', 'driving-traffic'
 * @returns Ruta ajustada con coordenadas en calles reales
 */
export const matchRouteToRoads = async (
  coordinates: Coordinate[],
  profile: 'driving' | 'walking' | 'cycling' | 'driving-traffic' = 'driving'
): Promise<MatchedRoute> => {
  try {
    // Validar que haya al menos 2 coordenadas
    if (coordinates.length < 2) {
      throw new Error('Se requieren al menos 2 coordenadas para hacer map matching');
    }

    // Validar que no exceda el límite de 100 coordenadas
    if (coordinates.length > 100) {
      throw new Error('Map Matching API acepta máximo 100 coordenadas. Divide tu ruta en segmentos más pequeños.');
    }

    // Formatear coordenadas: "lon,lat;lon,lat;lon,lat"
    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';');

    // Construir URL de la API
    const url = `https://api.mapbox.com/matching/v5/mapbox/${profile}/${coordinatesString}?` +
      `geometries=geojson&` +
      `overview=full&` +
      `steps=false&` +
      `tidy=false&` +
      `access_token=${MAPBOX_TOKEN}`;

    // Hacer la petición
    const response = await fetch(url);

    // Verificar errores de red
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Error de Map Matching API: ${response.status} - ${errorData.message || response.statusText}`
      );
    }

    const data: MapMatchingResponse = await response.json();

    // Verificar que la respuesta sea exitosa
    if (data.code !== 'Ok' || !data.matchings || data.matchings.length === 0) {
      throw new Error('No se pudo hacer match de la ruta con las calles');
    }

    // Extraer el primer matching (el mejor)
    const matching = data.matchings[0];

    // Retornar resultado procesado
    return {
      coordinates: matching.geometry.coordinates,
      distance: matching.distance,
      duration: matching.duration,
      confidence: matching.confidence
    };

  } catch (error) {
    console.error('Error en Map Matching:', error);
    
    // Si es un error conocido, re-lanzarlo
    if (error instanceof Error) {
      throw error;
    }
    
    // Error genérico
    throw new Error('Error al procesar la ruta con Map Matching API');
  }
};

/**
 * Simplifica una ruta reduciendo el número de puntos
 * Útil si tienes muchos puntos y quieres reducirlos antes de guardar
 * 
 * @param coordinates - Array de coordenadas
 * @param tolerance - Tolerancia para simplificación (mayor = menos puntos)
 * @returns Array simplificado de coordenadas
 */
export const simplifyRoute = (
  coordinates: Coordinate[],
  tolerance: number = 0.0001
): Coordinate[] => {
  // Esta es una simplificación básica
  // Para algo más avanzado, usa Turf.js o algoritmo Douglas-Peucker
  
  if (coordinates.length <= 2) {
    return coordinates;
  }

  const simplified: Coordinate[] = [coordinates[0]];
  
  for (let i = 1; i < coordinates.length - 1; i++) {
    const prev = coordinates[i - 1];
    const curr = coordinates[i];
    const next = coordinates[i + 1];
    
    // Calcular si el punto actual está significativamente desviado de la línea
    const distance = perpendicularDistance(curr, prev, next);
    
    if (distance > tolerance) {
      simplified.push(curr);
    }
  }
  
  simplified.push(coordinates[coordinates.length - 1]);
  
  return simplified;
};

// Función auxiliar para calcular distancia perpendicular
function perpendicularDistance(
  point: Coordinate,
  lineStart: Coordinate,
  lineEnd: Coordinate
): number {
  const [x, y] = point;
  const [x1, y1] = lineStart;
  const [x2, y2] = lineEnd;
  
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  let param = -1;
  if (lenSq !== 0) {
    param = dot / lenSq;
  }
  
  let xx, yy;
  
  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  
  const dx = x - xx;
  const dy = y - yy;
  
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calcula la distancia total de una ruta en metros
 * 
 * @param coordinates - Array de coordenadas
 * @returns Distancia en metros
 */
export const calculateRouteDistance = (coordinates: Coordinate[]): number => {
  let totalDistance = 0;
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const [lon1, lat1] = coordinates[i];
    const [lon2, lat2] = coordinates[i + 1];
    
    totalDistance += haversineDistance(lat1, lon1, lat2, lon2);
  }
  
  return totalDistance;
};

// Fórmula de Haversine para calcular distancia entre dos puntos
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}