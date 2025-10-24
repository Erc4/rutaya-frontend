// src/components/RoutesTrucks.tsx
import { useState } from 'react';
import { LocateFixedIcon } from 'lucide-react';
import { Button } from './ui/button';
import { AddRouteModal } from './AddRouteModal';

export const RoutesTrucks = () => {
  // Estado para controlar la apertura/cierre del modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Función para abrir el modal
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Gestión de Rutas</h2>
          <p className="text-neutral-600 text-lg">
            Administra las rutas de los camiones aquí.
          </p>
        </div>
        <div>
          <Button className="py-2 px-4" onClick={handleOpenModal}>
            <LocateFixedIcon className="mr-2" />
            Agregar Ruta
          </Button>
        </div>
      </div>

      {/* Modal para agregar rutas */}
      <AddRouteModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
};