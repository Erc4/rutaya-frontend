// src/components/AddDriverModal.tsx
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
import { addDriver } from '@/services/driversService';
import { Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

interface AddDriverModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddDriverModal = ({ open, onOpenChange }: AddDriverModalProps) => {
  const [nombre, setNombre] = useState('');
  const [apellido_paterno, setApellidoPaterno] = useState('');
  const [apellido_materno, setApellidoMaterno] = useState('');
  const [no_licencia, setNoLicencia] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setNombre('');
    setApellidoPaterno('');
    setApellidoMaterno('');
    setNoLicencia('');
    setError('');
    setSuccess(false);
    setIsSaving(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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

    setIsSaving(true);
    setError('');

    try {
      const result = await addDriver({
        nombre: nombre.trim(),
        apellido_paterno: apellido_paterno.trim(),
        apellido_materno: apellido_materno.trim(),
        no_licencia: no_licencia.trim(),
        activo: 1 // Por defecto los choferes nuevos están activos
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
      setError('Error inesperado al guardar el chofer');
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
          <DialogTitle>Agregar Nuevo Chofer</DialogTitle>
          <DialogDescription>
            Registra un nuevo chofer en el sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre(s) *</Label>
              <Input
                id="nombre"
                placeholder="Ej: Juan Carlos"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={isSaving || success}
                maxLength={50}
              />
            </div>

            {/* Apellido Paterno */}
            <div className="grid gap-2">
              <Label htmlFor="apellido_paterno">Apellido Paterno *</Label>
              <Input
                id="apellido_paterno"
                placeholder="Ej: González"
                value={apellido_paterno}
                onChange={(e) => setApellidoPaterno(e.target.value)}
                disabled={isSaving || success}
                maxLength={50}
              />
            </div>

            {/* Apellido Materno */}
            <div className="grid gap-2">
              <Label htmlFor="apellido_materno">Apellido Materno *</Label>
              <Input
                id="apellido_materno"
                placeholder="Ej: López"
                value={apellido_materno}
                onChange={(e) => setApellidoMaterno(e.target.value)}
                disabled={isSaving || success}
                maxLength={50}
              />
            </div>

            {/* Número de Licencia */}
            <div className="grid gap-2">
              <Label htmlFor="no_licencia">Número de Licencia *</Label>
              <Input
                id="no_licencia"
                placeholder="Ej: A1234567"
                value={no_licencia}
                onChange={(e) => setNoLicencia(e.target.value.toUpperCase())}
                disabled={isSaving || success}
                maxLength={20}
              />
              <p className="text-xs text-muted-foreground">
                La licencia se convertirá automáticamente a mayúsculas
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
                  ¡Chofer agregado exitosamente!
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
              {isSaving ? 'Guardando...' : 'Agregar Chofer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};