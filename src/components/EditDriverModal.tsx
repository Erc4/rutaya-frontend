// src/components/EditDriverModal.tsx
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
import { updateDriver } from '@/services/driversService';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import type { DriverWithId } from '@/services/driversService';

interface EditDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver: DriverWithId | null;
  onSuccess: () => void;
}

export const EditDriverModal = ({ open, onOpenChange, driver, onSuccess }: EditDriverModalProps) => {
  const [nombre, setNombre] = useState('');
  const [apellido_paterno, setApellidoPaterno] = useState('');
  const [apellido_materno, setApellidoMaterno] = useState('');
  const [no_licencia, setNoLicencia] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Cargar datos del chofer cuando el modal se abre
  useEffect(() => {
    if (open && driver) {
      setNombre(driver.nombre);
      setApellidoPaterno(driver.apellido_paterno);
      setApellidoMaterno(driver.apellido_materno);
      setNoLicencia(driver.no_licencia);
      setError('');
      setSuccess(false);
    }
  }, [open, driver]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driver) return;
    
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!apellido_paterno.trim()) {
      setError('El apellido paterno es requerido');
      return;
    }

    if (!apellido_materno.trim()) {
      setError('El apellido materno es requerido');
      return;
    }

    if (!no_licencia.trim()) {
      setError('El número de licencia es requerido');
      return;
    }

    setIsUpdating(true);
    setError('');

    try {
      const result = await updateDriver(driver.id, {
        nombre: nombre.trim(),
        apellido_paterno: apellido_paterno.trim(),
        apellido_materno: apellido_materno.trim(),
        no_licencia: no_licencia.trim()
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
      setError('Error inesperado al actualizar el chofer');
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellidoPaterno('');
    setApellidoMaterno('');
    setNoLicencia('');
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
          <DialogTitle>Editar Chofer</DialogTitle>
          <DialogDescription>
            Modifica los datos del chofer. Los cambios se guardarán inmediatamente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="edit-nombre">Nombre(s) *</Label>
              <Input
                id="edit-nombre"
                placeholder="Ej: Juan Carlos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isUpdating || success}
                maxLength={50}
              />
            </div>

            {/* Apellido Paterno */}
            <div className="grid gap-2">
              <Label htmlFor="edit-apellido_paterno">Apellido Paterno *</Label>
              <Input
                id="edit-apellido_paterno"
                placeholder="Ej: González"
                value={apellido_paterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                disabled={isUpdating || success}
                maxLength={50}
              />
            </div>

            {/* Apellido Materno */}
            <div className="grid gap-2">
              <Label htmlFor="edit-apellido_materno">Apellido Materno *</Label>
              <Input
                id="edit-apellido_materno"
                placeholder="Ej: López"
                value={apellido_materno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                disabled={isUpdating || success}
                maxLength={50}
              />
            </div>

            {/* Número de Licencia */}
            <div className="grid gap-2">
              <Label htmlFor="edit-no_licencia">Número de Licencia *</Label>
              <Input
                id="edit-no_licencia"
                placeholder="Ej: A1234567"
                value={no_licencia}
                onChange={(e) => setNoLicencia(e.target.value.toUpperCase())}
                disabled={isUpdating || success}
                maxLength={20}
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
                  Chofer actualizado exitosamente
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