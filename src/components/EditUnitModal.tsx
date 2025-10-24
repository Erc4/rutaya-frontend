// src/components/EditUnitModal.tsx
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
import { updateUnit } from '@/services/unitsService';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { UnitWithId } from '@/services/unitsService';

interface EditUnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: UnitWithId | null;
  onSuccess: () => void;
}

export const EditUnitModal = ({ open, onOpenChange, unit, onSuccess }: EditUnitModalProps) => {
  const [no_placas, setNoPlacas] = useState('');
  const [no_unidad, setNoUnidad] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cargar datos de la unidad cuando el modal se abre
  useEffect(() => {
    if (open && unit) {
      setNoPlacas(unit.no_placas);
      setNoUnidad(unit.no_unidad);
      setCapacidad(unit.capacidad.toString());
      setError('');
      setSuccess(false);
    }
  }, [open, unit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!unit) return;
    
    if (!no_placas.trim()) {
      setError('El número de placas es requerido');
      return;
    }

    if (!no_unidad.trim()) {
      setError('El número de unidad es requerido');
      return;
    }

    const capacidadNum = parseInt(capacidad);
    if (isNaN(capacidadNum) || capacidadNum <= 0 || !Number.isInteger(capacidadNum)) {
      setError('La capacidad debe ser un número entero mayor a 0');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const result = await updateUnit(unit.id, {
        no_placas: no_placas.trim(),
        no_unidad: no_unidad.trim(),
        capacidad: capacidadNum
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
      setError('Error inesperado al actualizar la unidad');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setNoPlacas('');
    setNoUnidad('');
    setCapacidad('');
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
          <DialogTitle>Editar Unidad</DialogTitle>
          <DialogDescription>
            Modifica los datos de la unidad. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Número de Placas */}
            <div className="grid gap-2">
              <Label htmlFor="edit-no_placas">Número de Placas *</Label>
              <Input
                id="edit-no_placas"
                placeholder="Ej: ABC-123-XYZ"
                value={no_placas}
                onChange={(e) => setNoPlacas(e.target.value.toUpperCase())}
                disabled={isUpdating || success}
                maxLength={20}
              />
            </div>

            {/* Número de Unidad */}
            <div className="grid gap-2">
              <Label htmlFor="edit-no_unidad">Número de Unidad *</Label>
              <Input
                id="edit-no_unidad"
                placeholder="Ej: 001"
                value={no_unidad}
                onChange={(e) => setNoUnidad(e.target.value)}
                disabled={isUpdating || success}
                maxLength={10}
              />
            </div>

            {/* Capacidad */}
            <div className="grid gap-2">
              <Label htmlFor="edit-capacidad">Capacidad (toneladas) *</Label>
              <Input
                id="edit-capacidad"
                type="number"
                placeholder="Ej: 15"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                disabled={isUpdating || success}
                min="0.1"
                step="0.1"
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
                  Unidad actualizada exitosamente
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