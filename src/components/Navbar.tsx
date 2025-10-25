import { Settings } from "lucide-react";

export const Navbar = () => {
  return (
    <header className="bg-emerald-600 border-b sticky top-0 z-10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <nav className="flex justify-between items-center p-4 text-white">
          <div className="flex gap-2">
            <Settings height={50} width={50} />
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-bold">Panel de Administración</h2>
              <p className="text-sm text-emerald-100">Gestiona tu aplicación</p>
            </div>
          </div>
          <a href="" className="text-emerald-50 hover:underline">Salir</a>
        </nav>
      </div>
    </header>
  );
};
