const Dashboard = () => {
  return (
    // CONTENEDOR PRINCIPAL (Mantiene el cálculo de altura exacto)
    <div className="w-full pl-4 pr-8 pb-4 h-[calc(100vh-12rem)] md:h-[calc(100vh-7rem)]">

      {/* GRID LAYOUT:
         - md:grid-cols-2 (2 columnas)
         - md:grid-rows-2 (2 filas)
         - gap-6 (Espacio idéntico de 24px entre columnas y entre filas)
      */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 md:grid-rows-2 gap-6">
        
        {/* CAJA 1: Arriba Izquierda */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
           <h2 className="text-xl font-bold text-slate-800 mb-4">Resumen</h2>
           {/* Contenido */}
        </div>

        {/* CAJA 2: Arriba Derecha */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Estadísticas</h2>
            {/* Contenido */}
        </div>

        {/* CAJA 3: Abajo Izquierda */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
           <h2 className="text-xl font-bold text-slate-800 mb-4">Actividad Reciente</h2>
           {/* Contenido */}
        </div>

        {/* CAJA 4: Abajo Derecha */}
        <div className="w-full h-full rounded-3xl glass p-6 overflow-hidden flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Avisos</h2>
            {/* Contenido */}
        </div>

      </div>

    </div>
  );
};

export default Dashboard;