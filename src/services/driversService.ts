// src/services/driversService.ts
import { 
  collection, 
  addDoc, 
  Timestamp, 
  getDocs, 
  query, 
  orderBy,
  doc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '@/lib/firebase.config';

// Interfaz para los datos de un chofer EN FIREBASE
export interface DriverData {
  apellido_paterno: string;
  apellido_materno: string;
  nombre: string;
  no_licencia: string;
  activo: number;
  createdAt: Timestamp;
}

// Interfaz para los choferes con su ID cuando los leemos de Firebase
export interface DriverWithId extends DriverData {
  id: string;
}

// Interfaz para crear un chofer (como la recibimos del componente)
export interface CreateDriverData {
  apellido_paterno: string;
  apellido_materno: string;
  nombre: string;
  no_licencia: string;
  activo: number;
}

/**
 * Agregar un nuevo chofer a Firebase
 * 
 * @param driverData - Datos del chofer
 * @returns Resultado de la operación con ID del documento
 */
export const addDriver = async (driverData: CreateDriverData) => {
  try {
    // Validar campos requeridos
    if (!driverData.nombre.trim()) {
      return {
        success: false,
        message: 'El nombre es requerido'
      };
    }

    if (!driverData.apellido_paterno.trim()) {
      return {
        success: false,
        message: 'El apellido paterno es requerido'
      };
    }

    if (!driverData.apellido_materno.trim()) {
      return {
        success: false,
        message: 'El apellido materno es requerido'
      };
    }

    if (!driverData.no_licencia.trim()) {
      return {
        success: false,
        message: 'El número de licencia es requerido'
      };
    }

    // Preparar datos para Firebase
    const dataWithTimestamp: DriverData = {
      nombre: driverData.nombre.trim(),
      apellido_paterno: driverData.apellido_paterno.trim(),
      apellido_materno: driverData.apellido_materno.trim(),
      no_licencia: driverData.no_licencia.trim().toUpperCase(),
      activo: driverData.activo,
      createdAt: Timestamp.now()
    };

    console.log('📦 Datos preparados para Firebase:', dataWithTimestamp);

    // Referencia a la colección 'choferes' en Firestore
    const driversCollection = collection(db, 'choferes');
    
    // Agregar el documento a Firestore
    const docRef = await addDoc(driversCollection, dataWithTimestamp);
    
    console.log('✅ Chofer agregado con ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Chofer agregado exitosamente',
      data: {
        id: docRef.id,
        ...dataWithTimestamp
      }
    };
  } catch (error) {
    console.error('❌ Error al agregar chofer:', error);
    
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
      
      console.error('Error detallado:', error.message);
    }
    
    return {
      success: false,
      message: 'Error al agregar el chofer. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Obtiene todos los choferes desde Firebase Firestore
 * 
 * @returns Array de choferes con sus IDs ordenados por fecha de creación (más recientes primero)
 */
export const getAllDrivers = async (): Promise<DriverWithId[]> => {
  try {
    // Referencia a la colección 'choferes'
    const driversCollection = collection(db, 'choferes');
    
    // Crear query para ordenar por fecha de creación descendente
    const q = query(driversCollection, orderBy('createdAt', 'desc'));
    
    // Obtener todos los documentos
    const querySnapshot = await getDocs(q);
    
    // Mapear los documentos a nuestro formato DriverWithId
    const drivers: DriverWithId[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as DriverData
    }));
    
    console.log('✅ Choferes obtenidos:', drivers.length);
    
    return drivers;
  } catch (error) {
    console.error('❌ Error al obtener choferes:', error);
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('Permisos denegados para leer choferes. Verifica las reglas de Firestore.');
      }
      if (error.message.includes('network')) {
        throw new Error('Error de conexión. Verifica tu internet.');
      }
    }
    
    throw new Error('Error al obtener los choferes. Por favor intenta de nuevo.');
  }
};

/**
 * Elimina un chofer de Firebase Firestore
 * 
 * @param driverId - ID del documento del chofer a eliminar
 * @returns Resultado de la operación
 */
export const deleteDriver = async (driverId: string) => {
  try {
    // Referencia al documento específico
    const driverDoc = doc(db, 'choferes', driverId);
    
    // Eliminar el documento
    await deleteDoc(driverDoc);
    
    console.log('✅ Chofer eliminado:', driverId);
    
    return {
      success: true,
      message: 'Chofer eliminado exitosamente'
    };
  } catch (error) {
    console.error('❌ Error al eliminar chofer:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return {
          success: false,
          message: 'Permisos denegados para eliminar choferes. Verifica las reglas de Firestore.'
        };
      }
      if (error.message.includes('network')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu internet.'
        };
      }
    }
    
    return {
      success: false,
      message: 'Error al eliminar el chofer. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Actualiza un chofer existente en Firebase Firestore
 * 
 * @param driverId - ID del documento del chofer a actualizar
 * @param updateData - Datos a actualizar
 * @returns Resultado de la operación
 */
export const updateDriver = async (
  driverId: string,
  updateData: {
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    no_licencia?: string;
  }
) => {
  try {
    // Referencia al documento específico
    const driverDoc = doc(db, 'choferes', driverId);
    
    // Preparar datos para actualizar
    const dataToUpdate: Partial<DriverData> = {};
    
    if (updateData.nombre !== undefined) {
      if (!updateData.nombre.trim()) {
        return {
          success: false,
          message: 'El nombre no puede estar vacío'
        };
      }
      dataToUpdate.nombre = updateData.nombre.trim();
    }
    
    if (updateData.apellido_paterno !== undefined) {
      if (!updateData.apellido_paterno.trim()) {
        return {
          success: false,
          message: 'El apellido paterno no puede estar vacío'
        };
      }
      dataToUpdate.apellido_paterno = updateData.apellido_paterno.trim();
    }
    
    if (updateData.apellido_materno !== undefined) {
      if (!updateData.apellido_materno.trim()) {
        return {
          success: false,
          message: 'El apellido materno no puede estar vacío'
        };
      }
      dataToUpdate.apellido_materno = updateData.apellido_materno.trim();
    }
    
    if (updateData.no_licencia !== undefined) {
      if (!updateData.no_licencia.trim()) {
        return {
          success: false,
          message: 'El número de licencia no puede estar vacío'
        };
      }
      dataToUpdate.no_licencia = updateData.no_licencia.trim().toUpperCase();
    }
    
    // Actualizar el documento
    await updateDoc(driverDoc, dataToUpdate);
    
    console.log('✅ Chofer actualizado:', driverId);
    
    return {
      success: true,
      message: 'Chofer actualizado exitosamente',
      data: dataToUpdate
    };
  } catch (error) {
    console.error('❌ Error al actualizar chofer:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return {
          success: false,
          message: 'Permisos denegados para actualizar choferes. Verifica las reglas de Firestore.'
        };
      }
      if (error.message.includes('network')) {
        return {
          success: false,
          message: 'Error de conexión. Verifica tu internet.'
        };
      }
    }
    
    return {
      success: false,
      message: 'Error al actualizar el chofer. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Cambia el estado activo/inactivo de un chofer
 * 
 * @param driverId - ID del documento del chofer
 * @param activo - Nuevo estado (1 = activo, 0 = inactivo)
 * @returns Resultado de la operación
 */
export const toggleDriverActive = async (driverId: string, activo: number) => {
  try {
    // Referencia al documento específico
    const driverDoc = doc(db, 'choferes', driverId);
    
    // Actualizar solo el campo activo
    await updateDoc(driverDoc, {
      activo: activo
    });
    
    console.log('✅ Estado de chofer actualizado:', driverId, '- Activo:', activo);
    
    return {
      success: true,
      message: `Chofer marcado como ${activo === 1 ? 'activo' : 'inactivo'}`,
      activo
    };
  } catch (error) {
    console.error('❌ Error al cambiar estado de chofer:', error);
    
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
    }
    
    return {
      success: false,
      message: 'Error al cambiar el estado del chofer.'
    };
  }
};

/**
 * Formatea el nombre completo del chofer
 * 
 * @param driver - Datos del chofer
 * @returns Nombre completo formateado
 */
export const formatFullName = (driver: DriverData | DriverWithId): string => {
  return `${driver.nombre} ${driver.apellido_paterno} ${driver.apellido_materno}`;
};