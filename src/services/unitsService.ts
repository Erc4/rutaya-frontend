// src/services/unitsService.ts
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

// Interfaz para los datos de una unidad EN FIREBASE
export interface UnitData {
  no_placas: string;
  no_unidad: string;
  capacidad: number;
  activo: number;
  createdAt: Timestamp;
}

// Interfaz para las unidades con su ID cuando las leemos de Firebase
export interface UnitWithId extends UnitData {
  id: string;
}

// Interfaz para crear una unidad (como la recibimos del componente)
export interface CreateUnitData {
  no_placas: string;
  no_unidad: string;
  capacidad: number;
  activo: number;
}

/**
 * Agregar una nueva unidad a Firebase
 * 
 * @param unitData - Datos de la unidad
 * @returns Resultado de la operación con ID del documento
 */
export const addUnit = async (unitData: CreateUnitData) => {
  try {
    // Validar campos requeridos
    if (!unitData.no_placas.trim()) {
      return {
        success: false,
        message: 'El número de placas es requerido'
      };
    }

    if (!unitData.no_unidad.trim()) {
      return {
        success: false,
        message: 'El número de unidad es requerido'
      };
    }

    if (unitData.capacidad <= 0 || !Number.isInteger(unitData.capacidad)) {
      return {
        success: false,
        message: 'La capacidad debe ser un número entero mayor a 0'
      };
    }

    // Preparar datos para Firebase
    const dataWithTimestamp: UnitData = {
      no_placas: unitData.no_placas.trim().toUpperCase(),
      no_unidad: unitData.no_unidad.trim(),
      capacidad: unitData.capacidad,
      activo: unitData.activo,
      createdAt: Timestamp.now()
    };

    console.log('📦 Datos preparados para Firebase:', dataWithTimestamp);

    // Referencia a la colección 'unidades' en Firestore
    const unitsCollection = collection(db, 'unidades');
    
    // Agregar el documento a Firestore
    const docRef = await addDoc(unitsCollection, dataWithTimestamp);
    
    console.log('✅ Unidad agregada con ID:', docRef.id);
    
    return {
      success: true,
      id: docRef.id,
      message: 'Unidad agregada exitosamente',
      data: {
        id: docRef.id,
        ...dataWithTimestamp
      }
    };
  } catch (error) {
    console.error('❌ Error al agregar unidad:', error);
    
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
      message: 'Error al agregar la unidad. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Obtiene todas las unidades desde Firebase Firestore
 * 
 * @returns Array de unidades con sus IDs ordenadas por fecha de creación (más recientes primero)
 */
export const getAllUnits = async (): Promise<UnitWithId[]> => {
  try {
    // Referencia a la colección 'unidades'
    const unitsCollection = collection(db, 'unidades');
    
    // Crear query para ordenar por fecha de creación descendente
    const q = query(unitsCollection, orderBy('createdAt', 'desc'));
    
    // Obtener todos los documentos
    const querySnapshot = await getDocs(q);
    
    // Mapear los documentos a nuestro formato UnitWithId
    const units: UnitWithId[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as UnitData
    }));
    
    console.log('✅ Unidades obtenidas:', units.length);
    
    return units;
  } catch (error) {
    console.error('❌ Error al obtener unidades:', error);
    
    // Manejo de errores específicos
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        throw new Error('Permisos denegados para leer unidades. Verifica las reglas de Firestore.');
      }
      if (error.message.includes('network')) {
        throw new Error('Error de conexión. Verifica tu internet.');
      }
    }
    
    throw new Error('Error al obtener las unidades. Por favor intenta de nuevo.');
  }
};

/**
 * Elimina una unidad de Firebase Firestore
 * 
 * @param unitId - ID del documento de la unidad a eliminar
 * @returns Resultado de la operación
 */
export const deleteUnit = async (unitId: string) => {
  try {
    // Referencia al documento específico
    const unitDoc = doc(db, 'unidades', unitId);
    
    // Eliminar el documento
    await deleteDoc(unitDoc);
    
    console.log('✅ Unidad eliminada:', unitId);
    
    return {
      success: true,
      message: 'Unidad eliminada exitosamente'
    };
  } catch (error) {
    console.error('❌ Error al eliminar unidad:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return {
          success: false,
          message: 'Permisos denegados para eliminar unidades. Verifica las reglas de Firestore.'
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
      message: 'Error al eliminar la unidad. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Actualiza una unidad existente en Firebase Firestore
 * 
 * @param unitId - ID del documento de la unidad a actualizar
 * @param updateData - Datos a actualizar
 * @returns Resultado de la operación
 */
export const updateUnit = async (
  unitId: string,
  updateData: {
    no_placas?: string;
    no_unidad?: string;
    capacidad?: number;
  }
) => {
  try {
    // Referencia al documento específico
    const unitDoc = doc(db, 'unidades', unitId);
    
    // Preparar datos para actualizar
    const dataToUpdate: Partial<UnitData> = {};
    
    if (updateData.no_placas !== undefined) {
      if (!updateData.no_placas.trim()) {
        return {
          success: false,
          message: 'El número de placas no puede estar vacío'
        };
      }
      dataToUpdate.no_placas = updateData.no_placas.trim().toUpperCase();
    }
    
    if (updateData.no_unidad !== undefined) {
      if (!updateData.no_unidad.trim()) {
        return {
          success: false,
          message: 'El número de unidad no puede estar vacío'
        };
      }
      dataToUpdate.no_unidad = updateData.no_unidad.trim();
    }
    
    if (updateData.capacidad !== undefined) {
      if (updateData.capacidad <= 0 || !Number.isInteger(updateData.capacidad)) {
        return {
          success: false,
          message: 'La capacidad debe ser un número entero mayor a 0'
        };
      }
      dataToUpdate.capacidad = updateData.capacidad;
    }
    
    // Actualizar el documento
    await updateDoc(unitDoc, dataToUpdate);
    
    console.log('✅ Unidad actualizada:', unitId);
    
    return {
      success: true,
      message: 'Unidad actualizada exitosamente',
      data: dataToUpdate
    };
  } catch (error) {
    console.error('❌ Error al actualizar unidad:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('permission-denied')) {
        return {
          success: false,
          message: 'Permisos denegados para actualizar unidades. Verifica las reglas de Firestore.'
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
      message: 'Error al actualizar la unidad. Por favor intenta de nuevo.'
    };
  }
};

/**
 * Cambia el estado activo/inactivo de una unidad
 * 
 * @param unitId - ID del documento de la unidad
 * @param activo - Nuevo estado (1 = activo, 0 = inactivo)
 * @returns Resultado de la operación
 */
export const toggleUnitActive = async (unitId: string, activo: number) => {
  try {
    // Referencia al documento específico
    const unitDoc = doc(db, 'unidades', unitId);
    
    // Actualizar solo el campo activo
    await updateDoc(unitDoc, {
      activo: activo
    });
    
    console.log('✅ Estado de unidad actualizado:', unitId, '- Activo:', activo);
    
    return {
      success: true,
      message: `Unidad marcada como ${activo === 1 ? 'activa' : 'inactiva'}`,
      activo
    };
  } catch (error) {
    console.error('❌ Error al cambiar estado de unidad:', error);
    
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
      message: 'Error al cambiar el estado de la unidad.'
    };
  }
};

/**
 * Formatea la capacidad de pasajeros
 * 
 * @param capacidad - Capacidad de pasajeros
 * @returns String formateado
 */
export const formatCapacity = (capacidad: number): string => {
  return `${capacidad.toLocaleString('es-MX')} ${capacidad === 1 ? 'pasajero' : 'pasajeros'}`;
};