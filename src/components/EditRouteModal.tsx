// src/components/EditRouteModal.tsx
import { useState, useEffect } from 'react';
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
import { updateRoute } from '@/services/routesService';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { RouteWithId } from '@/services/routesService';

interface EditRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: RouteWithId | null;
  onSuccess: () => void;
}

export const EditRouteModal = ({ open, onOpenChange, route, onSuccess }: EditRouteModalProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cargar datos de la ruta cuando el modal se abre
  useEffect(() => {
    if (open && route) {
      setNombre(route.nombre);
      setDescripcion(route.descripcion);
      setError('');
      setSuccess(false);
    }
  }, [open, route]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!route) return;
    
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const result = await updateRoute(route.id, {
        nombre: nombre.trim(),
        descripcion: descripcion.trim()
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
          resetForm();
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error inesperado al actualizar la ruta');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setError('');
    setSuccess(false);
    setIsUpdating(false);
  };

  const handleClose = () => {
    if (isUpdating) return;
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Ruta</DialogTitle>
          <DialogDescription>
            Modifica los datos de la ruta. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre de la ruta *</Label>
              <Input
                id="edit-nombre"
                placeholder="Ej: Ruta Centro - Norte"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isUpdating || success}
              />
            </div>

            {/* Descripción */}
            <div className="grid gap-2">
              <Label htmlFor="edit-descripcion">Descripción *</Label>
              <Textarea
                id="edit-descripcion"
                placeholder="Describe los detalles de esta ruta..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                disabled={isUpdating || success}
                rows={4}
              />
            </div>

            {/* Mensajes de error */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Mensaje de éxito */}
            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Ruta actualizada exitosamente
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating || success}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating || success}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUpdating ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};