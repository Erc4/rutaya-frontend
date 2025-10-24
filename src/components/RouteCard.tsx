// src/components/RouteCard.tsx
// src/components/RouteCard.tsx
import type { RouteWithId } from '@/services/routesService';
import { MapPin, Calendar, Navigation, Pencil, Trash2, Power } from 'lucide-react';
import { Button } from './ui/button';

interface RouteCardProps {
  route: RouteWithId;
  onEdit: (route: RouteWithId) => void;
  onDelete: (route: RouteWithId) => void;
  onToggleActive: (route: RouteWithId, newState: number) => void;
}

export const RouteCard = ({ route, onEdit, onDelete, onToggleActive }: RouteCardProps) => {
  // Formatear la fecha
  const formattedDate = route.createdAt?.toDate?.()?.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) || 'Fecha no disponible';

  // Contar waypoints
  const waypointsCount = route.waypoints ? route.waypoints.split(';').length : 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      {/* Header con nombre y estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {route.nombre}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {route.descripcion}
          </p>
        </div>
        <div className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          route.activo === 1 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {route.activo === 1 ? 'Activa' : 'Inactiva'}
        </div>
      </div>

      {/* Información adicional */}
      <div className="flex flex-col gap-2 mt-3 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{waypointsCount} puntos de ruta</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-mono truncate">ID: {route.id}</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(route)}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Editar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onToggleActive(route, route.activo === 1 ? 0 : 1)}
        >
          <Power className="w-3 h-3 mr-1" />
          {route.activo === 1 ? 'Desactivar' : 'Activar'}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(route)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};