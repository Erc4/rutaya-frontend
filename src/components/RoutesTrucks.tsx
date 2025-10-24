// src/components/RoutesTrucks.tsx
import { useState, useEffect } from 'react';
import { LocateFixedIcon, Loader2, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { AddRouteModal } from './AddRouteModal';
import { EditRouteModal } from './EditRouteModal';
import { DeleteRouteDialog } from './DeleteRouteDialog';
import { RouteCard } from './RouteCard';
import { 
  getAllRoutes, 
  deleteRoute, 
  toggleRouteActive,
  type RouteWithId 
} from '@/services/routesService';

// Fallback local implementation of useToast to avoid missing module error.
// Replace this with the app-wide toast hook implementation when available.
const useToast = () => {
  const toast = (options: { title?: string; description?: string; variant?: 'default' | 'destructive' } = {}) => {
    if (options.variant === 'destructive') {
      // Minimal visible fallback for destructive messages
      // eslint-disable-next-line no-alert
      alert(`${options.title ? options.title + ': ' : ''}${options.description ?? ''}`);
    } else {
      // eslint-disable-next-line no-console
      console.log('toast', options);
    }
  };
  return { toast };
};

export const RoutesTrucks = () => {
  // Estado para controlar modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Estado para las rutas
  const [routes, setRoutes] = useState<RouteWithId[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<RouteWithId | null>(null);
  
  // Estado para controlar procesos
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para el filtro de búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Hook para mostrar notificaciones
  const { toast } = useToast();

  // Función para cargar las rutas desde Firebase
  const loadRoutes = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedRoutes = await getAllRoutes();
      setRoutes(fetchedRoutes);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar las rutas';
      setError(errorMessage);
      console.error('Error cargando rutas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar rutas al montar el componente
  useEffect(() => {
    loadRoutes();
  }, []);

  // Handler para abrir modal de agregar
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // Handler para cerrar modal de agregar y recargar rutas
  const handleCloseAddModal = (open: boolean) => {
    setIsAddModalOpen(open);
    if (!open) {
      loadRoutes();
    }
  };

  // Handler para abrir modal de editar
  const handleEdit = (route: RouteWithId) => {
    setSelectedRoute(route);
    setIsEditModalOpen(true);
  };

  // Handler para cerrar modal de editar
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedRoute(null);
  };

  // Handler para cuando se actualiza una ruta
  const handleEditSuccess = () => {
    loadRoutes();
    toast({
      title: "Ruta actualizada",
      description: "La ruta se actualizó correctamente.",
    });
  };

  // Handler para abrir diálogo de eliminar
  const handleDelete = (route: RouteWithId) => {
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  // Handler para confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!selectedRoute) return;
    
    setIsDeleting(true);
    
    try {
      const result = await deleteRoute(selectedRoute.id);
      
      if (result.success) {
        toast({
          title: "Ruta eliminada",
          description: `La ruta "${selectedRoute.nombre}" se eliminó correctamente.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedRoute(null);
        loadRoutes();
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
        description: "No se pudo eliminar la ruta. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Handler para cambiar estado activo/inactivo
  const handleToggleActive = async (route: RouteWithId, newState: number) => {
    try {
      const result = await toggleRouteActive(route.id, newState);
      
      if (result.success) {
        toast({
          title: newState === 1 ? "Ruta activada" : "Ruta desactivada",
          description: `La ruta "${route.nombre}" ahora está ${newState === 1 ? 'activa' : 'inactiva'}.`,
        });
        loadRoutes();
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
        description: "No se pudo cambiar el estado de la ruta.",
        variant: "destructive",
      });
    }
  };

  // Filtrar rutas según el término de búsqueda
  const filteredRoutes = routes.filter(route => {
    const searchLower = searchTerm.toLowerCase();
    return (
      route.nombre.toLowerCase().includes(searchLower) ||
      route.descripcion.toLowerCase().includes(searchLower) ||
      route.id.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Gestión de Rutas</h2>
          <p className="text-neutral-600 text-lg">
            Administra las rutas de los camiones aquí.
          </p>
        </div>
        <div>
          <Button className="py-2 px-4" onClick={handleOpenAddModal}>
            <LocateFixedIcon className="mr-2" />
            Agregar Ruta
          </Button>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar rutas por nombre, descripción o ID..."
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
            <p className="text-muted-foreground">Cargando rutas...</p>
          </div>
        )}

        {/* Estado de error */}
        {!isLoading && error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
            <p className="text-destructive font-medium">Error al cargar rutas</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadRoutes}
              className="mt-3"
            >
              Reintentar
            </Button>
          </div>
        )}

        {/* Lista de rutas */}
        {!isLoading && !error && (
          <>
            {/* Contador de rutas */}
            <div className="mb-4 text-sm text-muted-foreground">
              {filteredRoutes.length === routes.length ? (
                <span>Mostrando {routes.length} {routes.length === 1 ? 'ruta' : 'rutas'}</span>
              ) : (
                <span>
                  Mostrando {filteredRoutes.length} de {routes.length} {routes.length === 1 ? 'ruta' : 'rutas'}
                </span>
              )}
            </div>

            {/* Grid de rutas */}
            {filteredRoutes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoutes.map((route) => (
                  <RouteCard 
                    key={route.id} 
                    route={route}
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
                    ? 'No se encontraron rutas que coincidan con tu búsqueda' 
                    : 'No hay rutas registradas todavía'}
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

      {/* Modal para agregar rutas */}
      <AddRouteModal open={isAddModalOpen} onOpenChange={handleCloseAddModal} />

      {/* Modal para editar rutas */}
      <EditRouteModal 
        open={isEditModalOpen} 
        onOpenChange={setIsEditModalOpen}
        route={selectedRoute}
        onSuccess={handleEditSuccess}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteRouteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        routeName={selectedRoute?.nombre || ''}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};