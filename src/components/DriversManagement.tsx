// src/components/DriversManagement.tsx
import { useState, useEffect } from 'react';
import { UserPlus, Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddDriverModal } from './AddDriverModal';
import { EditDriverModal } from './EditDriverModal';
import { DeleteDriverDialog } from './DeleteDriverDialog';
import { DriverCard } from './DriverCard';
import { 
  getAllDrivers, 
  deleteDriver, 
  toggleDriverActive,
  formatFullName,
  type DriverWithId 
} from '@/services/driversService';
import { useToast } from '@/hooks/use-toast';

export const DriversManagement = () => {
  // Estado para controlar modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Estado para los choferes
  const [drivers, setDrivers] = useState<DriverWithId[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<DriverWithId | null>(null);
  
  // Estado para controlar procesos
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Hook para mostrar notificaciones
  const { toast } = useToast();

  // Función para cargar los choferes desde Firebase
  const loadDrivers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedDrivers = await getAllDrivers();
      setDrivers(fetchedDrivers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar los choferes';
      setError(errorMessage);
      console.error('Error cargando choferes:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar choferes al montar el componente
  useEffect(() => {
    loadDrivers();
  }, []);

  // Handler para abrir modal de agregar
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handler para cerrar modal de agregar y recargar choferes
  const handleCloseAddModal = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      loadDrivers();
    }
  };

  // Handler para abrir modal de editar
  const handleEdit = (driver: DriverWithId) => {
    setSelectedDriver(driver);
    setIsEditModalOpen(true);
  };

  // Handler para cerrar modal de editar
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedDriver(null);
  };

  // Handler para cuando se actualiza un chofer
  const handleEditSuccess = () => {
    loadDrivers();
    toast({
      title: "Chofer actualizado",
      description: "El chofer se actualizó correctamente.",
    });
  };

  // Handler para abrir diálogo de eliminar
  const handleDelete = (driver: DriverWithId) => {
    setSelectedDriver(driver);
    setIsDeleteDialogOpen(true);
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedDriver) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteDriver(selectedDriver.id);
      
      if (result.success) {
        toast({
          title: "Chofer eliminado",
          description: `El chofer "${formatFullName(selectedDriver)}" se eliminó correctamente.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedDriver(null);
        loadDrivers();
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
        description: "No se pudo eliminar el chofer. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler para cambiar estado activo/inactivo
  const handleToggleActive = async (driver: DriverWithId, newState: number) => {
    try {
      const result = await toggleDriverActive(driver.id, newState);
      
      if (result.success) {
        toast({
          title: newState === 1 ? "Chofer activado" : "Chofer desactivado",
          description: `El chofer "${formatFullName(driver)}" ahora está ${newState === 1 ? 'activo' : 'inactivo'}.`,
        });
        loadDrivers();
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
        description: "No se pudo cambiar el estado del chofer.",
        variant: "destructive",
      });
    }
  };

  // Filtrar choferes según el término de búsqueda
  const filteredDrivers = drivers.filter(driver => {
    const searchLower = searchTerm.toLowerCase();
    const fullName = formatFullName(driver).toLowerCase();
    return (
      fullName.includes(searchLower) ||
      driver.nombre.toLowerCase().includes(searchLower) ||
      driver.apellido_paterno.toLowerCase().includes(searchLower) ||
      driver.apellido_materno.toLowerCase().includes(searchLower) ||
      driver.no_licencia.toLowerCase().includes(searchLower) ||
      driver.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Gestión de Personal</h2>
          <p className="text-neutral-600 text-lg">
            Administra los choferes aquí.
          </p>
        </div>
        <div>
          <Button className="py-2 px-4" onClick={handleOpenAddModal}>
            <UserPlus className="mr-2" />
            Agregar Chofer
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar choferes por nombre, apellidos, licencia o ID..."
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
            <p className="text-muted-foreground">Cargando choferes...</p>
          </div>
        )}

        {/* Estado de error */}
        {!isLoading && error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">Error al cargar choferes</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadDrivers}
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Lista de choferes */}
        {!isLoading && !error && (
          <>
            {/* Contador de choferes */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredDrivers.length === drivers.length ? (
                <span>Mostrando {drivers.length} {drivers.length === 1 ? 'chofer' : 'choferes'}</span>
              ) : (
                <span>
                  Mostrando {filteredDrivers.length} de {drivers.length} {drivers.length === 1 ? 'chofer' : 'choferes'}
                </span>
              )}
            </div>

            {/* Grid de choferes */}
            {filteredDrivers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrivers.map((driver) => (
                  <DriverCard 
                    key={driver.id} 
                    driver={driver}
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
                    ? 'No se encontraron choferes que coincidan con tu búsqueda' 
                    : 'No hay choferes registrados todavía'}
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

      {/* Modal para agregar choferes */}
      <AddDriverModal open={isAddModalOpen} onOpenChange={handleCloseAddModal} />

      {/* Modal para editar choferes */}
      <EditDriverModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        driver={selectedDriver}
        onSuccess={handleEditSuccess}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteDriverDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        driverName={selectedDriver ? formatFullName(selectedDriver) : ''}
        driverLicense={selectedDriver?.no_licencia || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};