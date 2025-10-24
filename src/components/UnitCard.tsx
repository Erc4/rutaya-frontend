// src/components/UnitCard.tsx
import { type UnitWithId, formatCapacity } from '@/services/unitsService';
import { Truck, Calendar, Hash, Users, Weight, Pencil, Trash2, Power } from 'lucide-react';
import { Button } from './ui/button';

interface UnitCardProps {
  unit: UnitWithId;
  onEdit: (unit: UnitWithId) => void;
  onDelete: (unit: UnitWithId) => void;
  onToggleActive: (unit: UnitWithId, newState: number) => void;
}

export const UnitCard = ({ unit, onEdit, onDelete, onToggleActive }: UnitCardProps) => {
  // Formatear la fecha
  const formattedDate = unit.createdAt?.toDate?.()?.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }) || 'Fecha no disponible';

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      {/* Header con placas y estado */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              {unit.no_placas}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Unidad #{unit.no_unidad}
          </p>
        </div>
        <div className={`ml-2 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
          unit.activo === 1 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }`}>
          {unit.activo === 1 ? 'Activa' : 'Inactiva'}
        </div>
      </div>

      {/* Información adicional */}
      <div className="flex flex-col gap-2 mt-3 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 flex-shrink-0" />
          <span>Capacidad: {formatCapacity(unit.capacidad)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-mono truncate">ID: {unit.id}</span>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(unit)}
        >
          <Pencil className="w-3 h-3 mr-1" />
          Editar
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onToggleActive(unit, unit.activo === 1 ? 0 : 1)}
        >
          <Power className="w-3 h-3 mr-1" />
          {unit.activo === 1 ? 'Desactivar' : 'Activar'}
        </Button>
        
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(unit)}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
};