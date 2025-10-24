// src/services/routesService.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

// Interfaz para los datos de una ruta
export interface RouteData {
  nombre: string;
  descripcion: string;
  activo: number;
  createdAt: Timestamp;
}

// Función para agregar una nueva ruta a Firebase
export const addRoute = async (routeData: Omit<RouteData, 'createdAt'>) => {
  try {
    // Agregar timestamp de creación
    const dataWithTimestamp = {
      ...routeData,
      createdAt: Timestamp.now()
    };

    // Referencia a la colección 'rutas' en Firestore
    const routesCollection = collection(db, 'rutas');
    
    // Agregar el documento a Firestore
    // Firebase generará automáticamente un ID único para el documento
    const docRef = await addDoc(routesCollection, dataWithTimestamp);
    
    console.log('Ruta agregada con ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Ruta agregada exitosamente'
    };
  } catch (error) {
    console.error('Error al agregar ruta:', error);
    return {
      success: false,
      message: 'Error al agregar la ruta. Por favor intenta de nuevo.'
    };
  }
};