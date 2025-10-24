import { LocateFixedIcon} from "lucide-react";
import { Button } from "./ui/button";
export const RoutesTrucks = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between ">
        <div className="flex flex-col">
          <h2 className="text-3xl font-bold">Gestión de Rutas</h2>
          <p className="text-neutral-600 text-lg">
            Administra las rutas de los camiones aquí.
          </p>
        </div>
        <div>
          <Button className="py-2 px-4">
            <LocateFixedIcon className="mr-2" />
            Agregar Ruta
          </Button>
        </div>
      </div>
    </div>
  );
};
