import { RoutesTrucks } from "./RoutesTrucks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export const Main = () => {
  return (
    <main className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8">
      <div className="p-4">
        <Tabs defaultValue="routes">
          <TabsList className="w-full">
            <TabsTrigger value="routes">Rutas</TabsTrigger>
            <TabsTrigger value="units">Unidades</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>
          <div className="mb-2">
            <TabsContent value="routes">
              <RoutesTrucks />
            </TabsContent>
            <TabsContent value="units">
              Make changes to your units here.
            </TabsContent>
            <TabsContent value="personal">
              Make changes to your personal here.
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  );
};
