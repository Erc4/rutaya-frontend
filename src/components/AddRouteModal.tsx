// src/components/AddRouteModal.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { addRoute } from '@/services/routesService';

interface AddRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRouteModal = ({ open, onOpenChange }: AddRouteModalProps) => {
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Función para resetear el formulario
  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setError('');
  };

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación básica
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Enviar datos a Firebase
      // El campo 'activo' se establece por defecto en 1
      const result = await addRoute({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: 1, // Por defecto activo
      });

      if (result.success) {
        // Mostrar mensaje de éxito (puedes usar una librería de toast aquí)
        console.log('✅ Ruta guardada exitosamente');
        
        // Resetear formulario y cerrar modal
        resetForm();
        onOpenChange(false);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error inesperado al guardar la ruta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Función para manejar el cierre del modal
  const handleClose = () => {
    if (!loading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Agregar Nueva Ruta</DialogTitle>
          <DialogDescription>
            Completa los datos de la ruta. El mapa se mostrará en el panel derecho.
          </DialogDescription>
        </DialogHeader>

        {/* Contenedor principal dividido en dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* Columna Izquierda - Formulario */}
          <div className="overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre de la Ruta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Ruta Centro"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={loading}
                  maxLength={100}
                />
              </div>

              {/* Campo Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la ruta, puntos de interés, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={loading}
                  rows={6}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {descripcion.length}/500 caracteres
                </p>
              </div>

              {/* Información adicional */}
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <h4 className="text-sm font-semibold">Información automática:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• El ID se generará automáticamente</li>
                  <li>• El estado será "Activo" por defecto</li>
                  <li>• La fecha de creación se registrará automáticamente</li>
                </ul>
              </div>

              {/* Mensaje de error */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>

          {/* Columna Derecha - Placeholder para el Mapa */}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900/50">
            <div className="text-center p-8">
              <div className="text-4xl mb-4">🗺️</div>
              <h3 className="text-lg font-semibold mb-2">
                Mapa Interactivo
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                Aquí se mostrará el mapa de Mapbox para seleccionar y visualizar la ruta
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                (Funcionalidad de mapa próximamente)
              </div>
            </div>
          </div>
        </div>

        {/* Footer con botones */}
        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Ruta'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};