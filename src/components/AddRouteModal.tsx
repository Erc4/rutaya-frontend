// src/components/AddRouteModal.tsx
import { useState, useCallback } from 'react';
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
import { RouteMapDrawer } from './RouteMapDrawer';
import { addRoute, formatDistance, formatDuration } from '@/services/routesService';
import { matchRouteToRoads, type Coordinate, type MatchedRoute } from '@/services/mapMatchingService';
import { Loader2, CheckCircle2, AlertTriangle, X } from 'lucide-react';

interface AddRouteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProcessState = 'idle' | 'matching' | 'saving' | 'success';

export const AddRouteModal = ({ open, onOpenChange }: AddRouteModalProps) => {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [waypoints, setWaypoints] = useState('');
  const [profile, setProfile] = useState<'driving' | 'walking' | 'cycling'>('driving');
  
  const [drawnCoordinates, setDrawnCoordinates] = useState<Coordinate[]>([]);
  const [matchedRoute, setMatchedRoute] = useState<MatchedRoute | null>(null);
  
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setNombre('');
    setDescripcion('');
    setWaypoints('');
    setProfile('driving');
    setDrawnCoordinates([]);
    setMatchedRoute(null);
    setError('');
    setProcessState('idle');
  }, []);

  const handleRouteDrawn = useCallback(async (coordinates: Coordinate[]) => {
    setDrawnCoordinates(coordinates);
    setError('');
    setProcessState('matching');
    
    try {
      const matched = await matchRouteToRoads(coordinates, profile);
      setMatchedRoute(matched);
      setProcessState('idle');
      
      console.log('✅ Ruta ajustada con Map Matching:', {
        puntos: matched.coordinates.length,
        distancia: formatDistance(matched.distance),
        duracion: formatDuration(matched.duration),
        confianza: (matched.confidence * 100).toFixed(1) + '%'
      });
    } catch (err) {
      console.error('Error en Map Matching:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Error al procesar la ruta. Intenta dibujar de nuevo.'
      );
      setProcessState('idle');
      setMatchedRoute(null);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre.trim()) {
      setError('El nombre es requerido');
      return;
    }

    if (!descripcion.trim()) {
      setError('La descripción es requerida');
      return;
    }

    if (!matchedRoute || matchedRoute.coordinates.length < 2) {
      setError('Debes dibujar una ruta en el mapa primero');
      return;
    }

    setProcessState('saving');
    setError('');

    try {
      const result = await addRoute({
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        activo: 1,
        coordinates: matchedRoute.coordinates,
        distance: matchedRoute.distance,
        duration: matchedRoute.duration,
        profile: profile
      });

      if (result.success) {
        setProcessState('success');
        setTimeout(() => {
          resetForm();
          onOpenChange(false);
        }, 1500);
      } else {
        setError(result.message);
        setProcessState('idle');
      }
    } catch (err) {
      setError('Error inesperado al guardar la ruta');
      console.error(err);
      setProcessState('idle');
    }
  };

  const handleClose = () => {
    if (processState === 'matching' || processState === 'saving') {
      return;
    }
    resetForm();
    onOpenChange(false);
  };

  const getProcessMessage = () => {
    switch (processState) {
      case 'matching':
        return 'Ajustando ruta a las calles con Map Matching API...';
      case 'saving':
        return 'Guardando ruta en Firebase...';
      case 'success':
        return '¡Ruta guardada exitosamente!';
      default:
        return '';
    }
  };

  const isProcessing = processState === 'matching' || processState === 'saving';
  const isSuccess = processState === 'success';

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header - Barra superior fija */}
      <div className="h-16 border-b bg-background px-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Agregar Nueva Ruta</h2>
          <p className="text-sm text-muted-foreground">
            Dibuja la ruta en el mapa y completa los datos
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          disabled={isProcessing}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Contenido principal */}
      <div className="h-[calc(100vh-8rem)] flex">
        
        {/* Sidebar izquierdo - Formulario */}
        <div className="w-96 border-r bg-muted/30 overflow-y-auto">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="nombre">
                  Nombre de la Ruta <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="nombre"
                  placeholder="Ej: Ruta Centro"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  disabled={isProcessing}
                  maxLength={100}
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">
                  Descripción <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describe la ruta, puntos de interés, horarios, etc."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  disabled={isProcessing}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {descripcion.length}/500 caracteres
                </p>
              </div>

              {/* Waypoints - NUEVO CAMPO */}
              <div className="space-y-2">
                <Label htmlFor="waypoints">
                  Waypoints
                </Label>
                <Textarea
                  id="waypoints"
                  placeholder="Puntos de referencia: Ej: Plaza Central, Mercado, Parque..."
                  value={waypoints}
                  onChange={(e) => setWaypoints(e.target.value)}
                  disabled={isProcessing}
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  Opcional - Puntos de interés en la ruta
                </p>
              </div>

              {/* Tipo de Ruta */}
              <div className="space-y-2">
                <Label htmlFor="profile">
                  Tipo de Ruta <span className="text-red-500">*</span>
                </Label>
                <select
                  id="profile"
                  value={profile}
                  onChange={(e) => setProfile(e.target.value as any)}
                  disabled={isProcessing}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="driving">🚗 Automóvil</option>
                  <option value="walking">🚶 Caminando</option>
                  <option value="cycling">🚴 Bicicleta</option>
                </select>
              </div>

              {/* Información de Ruta Procesada */}
              {matchedRoute && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <h4 className="text-sm font-semibold text-green-700 dark:text-green-300">
                      Ruta Procesada
                    </h4>
                  </div>
                  <div className="text-xs space-y-1 text-green-700 dark:text-green-300">
                    <p>📍 Puntos: {matchedRoute.coordinates.length}</p>
                    <p>📏 Distancia: {formatDistance(matchedRoute.distance)}</p>
                    <p>⏱️ Duración: {formatDuration(matchedRoute.duration)}</p>
                    <p>🎯 Confianza: {(matchedRoute.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {/* Mensaje de proceso */}
              {(isProcessing || isSuccess) && (
                <div className={`flex items-center gap-3 p-3 rounded-lg ${
                  isSuccess 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                    : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                  {isSuccess && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  <span className={`text-xs font-medium ${
                    isSuccess ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'
                  }`}>
                    {getProcessMessage()}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span className="text-xs">{error}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Mapa - Ocupa TODO el resto de la pantalla */}
        <div className="flex-1">
          <RouteMapDrawer onRouteCreated={handleRouteDrawn} />
        </div>
      </div>

      {/* Footer - Barra inferior fija */}
      <div className="h-16 border-t bg-background px-6 flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isProcessing}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          onClick={handleSubmit}
          disabled={isProcessing || !matchedRoute}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Guardado
            </>
          ) : (
            'Guardar Ruta'
          )}
        </Button>
      </div>
    </div>
  );
};