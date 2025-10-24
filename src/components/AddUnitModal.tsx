// src/components/AddUnitModal.tsx
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
import { addUnit } from '@/services/unitsService';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AddUnitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddUnitModal = ({ open, onOpenChange }: AddUnitModalProps) => {
  const [no_placas, setNoPlacas] = useState('');
  const [no_unidad, setNoUnidad] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setNoPlacas('');
    setNoUnidad('');
    setCapacidad('');
    setError('');
    setSuccess(false);
    setIsSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsSaving(true);
    setError('');

    try {
      const result = await addUnit({
        no_placas: no_placas.trim(),
        no_unidad: no_unidad.trim(),
        capacidad: capacidadNum,
        activo: 1 // Por defecto las unidades nuevas están activas
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          resetForm();
          onOpenChange(false);
        }, 1500);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error inesperado al guardar la unidad');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (isSaving) return;
    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Nueva Unidad</DialogTitle>
          <DialogDescription>
            Registra una nueva unidad (vehículo) en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Número de Placas */}
            <div className="grid gap-2">
              <Label htmlFor="no_placas">Número de Placas *</Label>
              <Input
                id="no_placas"
                placeholder="Ej: ABC-123-XYZ"
                value={no_placas}
                onChange={(e) => setNoPlacas(e.target.value.toUpperCase())}
                disabled={isSaving || success}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                Las placas se convertirán automáticamente a mayúsculas
              </p>
            </div>

            {/* Número de Unidad */}
            <div className="grid gap-2">
              <Label htmlFor="no_unidad">Número de Unidad *</Label>
              <Input
                id="no_unidad"
                placeholder="Ej: 001"
                value={no_unidad}
                onChange={(e) => setNoUnidad(e.target.value)}
                disabled={isSaving || success}
                maxLength={10}
              />
            </div>

            {/* Capacidad */}
            <div className="grid gap-2">
              <Label htmlFor="capacidad">Capacidad (pasajeros) *</Label>
              <Input
                id="capacidad"
                type="number"
                placeholder="Ej: 45"
                value={capacidad}
                onChange={(e) => setCapacidad(e.target.value)}
                disabled={isSaving || success}
                min="1"
                step="1"
              />
              <p className="text-xs text-muted-foreground">
                Ingresa la cantidad de pasajeros que puede transportar
              </p>
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
                  ¡Unidad agregada exitosamente!
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSaving || success}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving || success}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Guardando...' : 'Agregar Unidad'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};