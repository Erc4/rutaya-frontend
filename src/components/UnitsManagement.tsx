// src/components/UnitsManagement.tsx
import { useState, useEffect } from 'react';
import { TruckIcon, Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddUnitModal } from './AddUnitModal';
import { EditUnitModal } from './EditUnitModal';
import { DeleteUnitDialog } from './DeleteUnitDialog';
import { UnitCard } from './UnitCard';
import { 
  getAllUnits, 
  deleteUnit, 
  toggleUnitActive,
  type UnitWithId 
} from '@/services/unitsService';
import { useToast } from '@/hooks/use-toast';

export const UnitsManagement = () => {
  // Estado para controlar modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Estado para las unidades
  const [units, setUnits] = useState<UnitWithId[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithId | null>(null);
  
  // Estado para controlar procesos
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Hook para mostrar notificaciones
  const { toast } = useToast();

  // Función para cargar las unidades desde Firebase
  const loadUnits = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedUnits = await getAllUnits();
      setUnits(fetchedUnits);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las unidades';
      setError(errorMessage);
      console.error('Error cargando unidades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar unidades al montar el componente
  useEffect(() => {
    loadUnits();
  }, []);

  // Handler para abrir modal de agregar
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handler para cerrar modal de agregar y recargar unidades
  const handleCloseAddModal = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      loadUnits();
    }
  };

  // Handler para abrir modal de editar
  const handleEdit = (unit: UnitWithId) => {
    setSelectedUnit(unit);
    setIsEditModalOpen(true);
  };

  // Handler para cerrar modal de editar
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUnit(null);
  };

  // Handler para cuando se actualiza una unidad
  const handleEditSuccess = () => {
    loadUnits();
    toast({
      title: "Unidad actualizada",
      description: "La unidad se actualizó correctamente.",
    });
  };

  // Handler para abrir diálogo de eliminar
  const handleDelete = (unit: UnitWithId) => {
    setSelectedUnit(unit);
    setIsDeleteDialogOpen(true);
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedUnit) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteUnit(selectedUnit.id);
      
      if (result.success) {
        toast({
          title: "Unidad eliminada",
          description: `La unidad "${selectedUnit.no_placas}" se eliminó correctamente.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedUnit(null);
        loadUnits();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler para cambiar estado activo/inactivo
  const handleToggleActive = async (unit: UnitWithId, newState: number) => {
    try {
      const result = await toggleUnitActive(unit.id, newState);
      
      if (result.success) {
        toast({
          title: newState === 1 ? "Unidad activada" : "Unidad desactivada",
          description: `La unidad "${unit.no_placas}" ahora está ${newState === 1 ? 'activa' : 'inactiva'}.`,
        });
        loadUnits();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado de la unidad.",
        variant: "destructive",
      });
    }
  };

  // Filtrar unidades según el término de búsqueda
  const filteredUnits = units.filter(unit => {
    const searchLower = searchTerm.toLowerCase();
    return (
      unit.no_placas.toLowerCase().includes(searchLower) ||
      unit.no_unidad.toLowerCase().includes(searchLower) ||
      unit.id.toLowerCase().includes(searchLower) ||
      unit.capacidad.toString().includes(searchLower)
    );
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Gestión de Unidades</h2>
          <p className="text-neutral-600 text-lg">
            Administra las unidades (vehículos) aquí.
          </p>
        </div>
        <div>
          <Button className="py-2 px-4" onClick={handleOpenAddModal}>
            <TruckIcon className="mr-2" />
            Agregar Unidad
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar unidades por placas, número, capacidad o ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mt-6">
        {/* Estado de carga */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Cargando unidades...</p>
          </div>
        )}

        {/* Estado de error */}
        {!isLoading && error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">Error al cargar unidades</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadUnits}
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Lista de unidades */}
        {!isLoading && !error && (
          <>
            {/* Contador de unidades */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredUnits.length === units.length ? (
                <span>Mostrando {units.length} {units.length === 1 ? 'unidad' : 'unidades'}</span>
              ) : (
                <span>
                  Mostrando {filteredUnits.length} de {units.length} {units.length === 1 ? 'unidad' : 'unidades'}
                </span>
              )}
            </div>

            {/* Grid de unidades */}
            {filteredUnits.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUnits.map((unit) => (
                  <UnitCard 
                    key={unit.id} 
                    unit={unit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleActive={handleToggleActive}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'No se encontraron unidades que coincidan con tu búsqueda' 
                    : 'No hay unidades registradas todavía'}
                </p>
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSearchTerm('')}
                    className="mt-2"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para agregar unidades */}
      <AddUnitModal open={isAddModalOpen} onOpenChange={handleCloseAddModal} />

      {/* Modal para editar unidades */}
      <EditUnitModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        unit={selectedUnit}
        onSuccess={handleEditSuccess}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteUnitDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        unitPlates={selectedUnit?.no_placas || ''}
        unitNumber={selectedUnit?.no_unidad || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};