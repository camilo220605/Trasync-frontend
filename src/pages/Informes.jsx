import React, { useState } from "react";
import { Calendar, BarChart2, Download, Filter, Printer, Clock, FileText, ChevronDown } from "lucide-react";

const Informes = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [loading, setLoading] = useState(false);
  const [reports] = useState([]);
  
  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Implementar la llamada a la API real para generar el informe
      // const response = await api.generateReport(params);
      // Si la generación es exitosa, actualizar la lista de informes
      // await fetchReports();
      
      // Para propósitos de demostración (remover en producción)
      setTimeout(() => {
        setLoading(false);
        alert("Informe generado con éxito");
      }, 300);
    } catch (error) {
      console.error("Error al generar el informe:", error);
      alert("Error al generar el informe");
    } finally {
      // setLoading(false); // Descomentar cuando se implemente la API real
    }
  };
  
  const filteredReports = reports.filter(report => {
    if (activeTab === "general") return true;
    return report.type === activeTab;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto text-gray-800">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2 text-gray-800">
          <FileText className="text-blue-600" />
          Informes y Estadísticas
        </h1>
        <p className="text-base text-gray-600 mt-0">
          Genera y visualiza informes detallados sobre el sistema de transporte público
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6 gap-1">
        {[
          { id: "general", label: "General" },
          { id: "rutas", label: "Rutas" },
          { id: "vehiculos", label: "Vehículos" },
          { id: "horarios", label: "Horarios" },
          { id: "conductores", label: "Conductores" }
        ].map(tab => (
          <button 
            key={tab.id}
            className={`px-4 py-3 bg-transparent border-none border-b-2 text-sm font-medium cursor-pointer transition-all duration-200 ${
              activeTab === tab.id 
                ? "text-blue-600 border-blue-600 font-semibold" 
                : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel Container */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 mb-6">
        {/* Generate Report Panel */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg m-0 font-semibold text-gray-700">Generar nuevo informe</h2>
          </div>
          <div className="p-5">
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-sm text-gray-600">Tipo de informe</label>
              <div className="relative">
                <select className="w-full py-2.5 px-3 pr-9 border border-gray-200 rounded-md text-sm transition-all duration-200 text-gray-700 appearance-none focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none">
                  <option>Ocupación por ruta</option>
                  <option>Puntualidad de servicios</option>
                  <option>Estado de la flota</option>
                  <option>Incidencias reportadas</option>
                  <option>Ganancias por ruta</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none w-4 h-4" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="mb-4">
                <label className="block mb-1.5 font-medium text-sm text-gray-600">Fecha inicial</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="date" 
                    className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-md text-sm transition-all duration-200 text-gray-700 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({...dateRange, from: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block mb-1.5 font-medium text-sm text-gray-600">Fecha final</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="date" 
                    className="w-full py-2.5 pl-10 pr-3 border border-gray-200 rounded-md text-sm transition-all duration-200 text-gray-700 focus:border-blue-600 focus:shadow-[0_0_0_3px_rgba(49,130,206,0.15)] focus:outline-none"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({...dateRange, to: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block mb-1.5 font-medium text-sm text-gray-600">Formato</label>
              <div className="flex gap-4 mt-1.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="format" value="pdf" defaultChecked className="m-0" />
                  <span>PDF</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="format" value="excel" className="m-0" />
                  <span>Excel</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" name="format" value="csv" className="m-0" />
                  <span>CSV</span>
                </label>
              </div>
            </div>
            
            <button 
              className={`flex items-center justify-center gap-2 text-white border-none py-3 px-6 rounded-md font-semibold text-sm cursor-pointer transition-all duration-200 ease-in-out w-full mt-4 ${
                loading 
                  ? "bg-blue-300 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <BarChart2 className="w-4 h-4" />
                  Generar informe
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Recent Reports Panel */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden h-fit">
          <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg m-0 font-semibold text-gray-700">Informes recientes</h2>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 bg-gray-100 text-gray-600 border-none py-2 px-3 rounded text-xs font-medium cursor-pointer transition-all duration-200 hover:bg-gray-200 hover:text-blue-600">
                <Filter className="w-4 h-4" />
                Filtrar
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">Nombre</th>
                  <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">Fecha</th>
                  <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">Descargas</th>
                  <th className="text-left py-3 px-4 bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map(report => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 border-b border-gray-100 text-gray-700">{report.name}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-gray-700">{report.date}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-gray-700">{report.downloads}</td>
                      <td className="py-3 px-4 border-b border-gray-100 text-gray-700">
                        <div className="flex gap-2">
                          <button className="flex items-center justify-center bg-transparent border border-gray-200 rounded w-7 h-7 cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600 hover:border-gray-300" title="Descargar">
                            <Download size={16} />
                          </button>
                          <button className="flex items-center justify-center bg-transparent border border-gray-200 rounded w-7 h-7 cursor-pointer text-gray-600 transition-all duration-200 hover:bg-gray-100 hover:text-blue-600 hover:border-gray-300" title="Imprimir">
                            <Printer size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-gray-500 italic">
                      No hay informes disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h3 className="text-base font-semibold mt-0 mb-4 text-gray-700">Estadísticas rápidas</h3>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Informes generados este mes:</span>
              <span className="font-semibold text-gray-700">0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Ruta más analizada:</span>
              <span className="font-semibold text-gray-700">-</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Descargas totales:</span>
              <span className="font-semibold text-gray-700">0</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h3 className="text-base font-semibold mt-0 mb-4 text-gray-700">Programar informes</h3>
            <p className="mb-0">Configura informes automáticos periódicos enviados directamente a tu correo.</p>
            <button className="bg-gray-100 text-blue-600 border-none py-2 px-4 rounded font-medium cursor-pointer transition-all duration-200 mt-3 hover:bg-gray-200 hover:text-blue-700">Configurar</button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-5">
            <h3 className="text-base font-semibold mt-0 mb-4 text-gray-700">Personalizar informes</h3>
            <p className="mb-0">Crea plantillas personalizadas para tus necesidades específicas.</p>
            <button className="bg-gray-100 text-blue-600 border-none py-2 px-4 rounded font-medium cursor-pointer transition-all duration-200 mt-3 hover:bg-gray-200 hover:text-blue-700">Crear plantilla</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Informes;