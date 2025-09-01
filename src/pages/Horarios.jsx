// src/pages/Horarios.jsx
import React, { useState, useEffect } from "react";
import {
  Clock,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  CheckCircle,
  Loader,
  Filter,
  RefreshCw
} from "lucide-react";
import apiClient from "../api/baseAPI";

const Horarios = () => {
  // Estados principales
  const [filtroRuta, setFiltroRuta] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("all");
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [conductores, setConductores] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    idVehiculo: "",
    idConductor: "",
    idRuta: "",
    fecHorSalViaje: "",
    fecHorLleViaje: "",
    estViaje: "PROGRAMADO",
    obsViaje: "",
  });

  // Estados de error y éxito
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================
  // Helpers para manejo robusto de datos
  // ============================
  const getNested = (obj, path) => {
    try {
      return path.split(".").reduce((a, b) => a?.[b], obj);
    } catch (e) {
      return undefined;
    }
  };

  const getField = (obj, candidates = []) => {
    for (const c of candidates) {
      if (c.includes(".")) {
        const v = getNested(obj, c);
        if (v !== undefined && v !== null) return v;
      } else {
        if (obj?.[c] !== undefined && obj?.[c] !== null) return obj[c];
      }
    }
    return null;
  };

  const parseDateForDisplay = (s) => {
    if (!s && s !== 0) return "";
    try {
      let str = String(s);
      if (str.includes(" ") && !str.includes("T")) str = str.replace(" ", "T");
      const d = new Date(str);
      if (isNaN(d)) return String(s);
      return d.toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return String(s);
    }
  };

  const formatForInput = (s) => {
    if (!s) return "";
    let str = String(s);
    if (str.includes(" ") && !str.includes("T")) str = str.replace(" ", "T");
    const d = new Date(str);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 16);
  };

  const formatForApi = (s) => {
    if (!s) return null;
    return s.replace("T", " ") + ":00";
  };

  // ============================
  // Funciones para obtener labels
  // ============================
  const getVehicleLabel = (viajeObj) => {
    const idVeh = getField(viajeObj, ["idVehiculo", "id_vehiculo", "vehiculoId"]);
    if (!idVeh) return "-";
    
    // Primero buscar por datos anidados (JOIN)
    const placa = getField(viajeObj, ["plaVehiculo", "placaVehiculo"]);
    const marca = getField(viajeObj, ["marVehiculo"]);
    const modelo = getField(viajeObj, ["modVehiculo"]);
    const numero = getField(viajeObj, ["numVehiculo"]);
    
    if (placa || marca || modelo) {
      return `${placa || numero || "Veh"} ${marca && modelo ? `- ${marca} ${modelo}` : ""}`.trim();
    }
    
    // Si no hay datos del JOIN, buscar en la lista de vehículos
    const v = vehiculos.find(x => 
      Number(getField(x, ["idVehiculo", "id"])) === Number(idVeh)
    );
    
    if (!v) return `Veh#${idVeh}`;
    
    const vPlaca = getField(v, ["placaVehiculo", "plaVehiculo", "placa"]);
    const vModelo = getField(v, ["modeloVehiculo", "marVehiculo", "modVehiculo"]);
    const vNum = getField(v, ["numVehiculo", "numeroInterno"]);
    
    return `${vPlaca || vNum || "Veh"} ${vModelo ? `- ${vModelo}` : ""}`.trim();
  };

  const getConductorLabel = (viajeObj) => {
    const idCond = getField(viajeObj, ["idConductor", "id_conductor", "conductorId"]);
    if (!idCond) return "-";
    
    // Primero buscar por datos anidados (JOIN)
    const nom = getField(viajeObj, ["nomConductor", "nombreConductor"]);
    const ape = getField(viajeObj, ["apeConductor", "apellidoConductor"]);
    
    if (nom || ape) {
      return `${nom || ""} ${ape || ""}`.trim() || `Cond#${idCond}`;
    }
    
    // Si no hay datos del JOIN, buscar en la lista de conductores
    const c = conductores.find(x => 
      Number(getField(x, ["idConductor", "id"])) === Number(idCond)
    );
    
    if (!c) return `Cond#${idCond}`;
    
    const cNom = getField(c, ["nombreConductor", "nomConductor", "nom_conductor"]);
    const cApe = getField(c, ["apellidoConductor", "apeConductor", "ape_conductor", "apellido"]);
    
    if (cNom && cApe) return `${cNom} ${cApe}`;
    if (cNom) return cNom;
    
    return getField(c, ["nombreCompleto", "nombre"]) || `Cond#${idCond}`;
  };

  const getRutaLabel = (viajeObj) => {
    const idRuta = getField(viajeObj, ["idRuta", "id_ruta", "rutaId"]);
    if (!idRuta) return "-";
    
    // Primero buscar por datos anidados (JOIN)
    const nomRuta = getField(viajeObj, ["nomRuta", "nombreRuta"]);
    const origen = getField(viajeObj, ["oriRuta"]);
    const destino = getField(viajeObj, ["desRuta"]);
    
    if (nomRuta) {
      return origen && destino ? `${nomRuta} (${origen} → ${destino})` : nomRuta;
    }
    
    // Si no hay datos del JOIN, buscar en la lista de rutas
    const r = rutas.find(x => 
      Number(getField(x, ["idRuta", "id"])) === Number(idRuta)
    );
    
    if (!r) return `Ruta#${idRuta}`;
    
    const rNom = getField(r, ["nomRuta", "nombreRuta", "nom_ruta"]);
    const rOri = getField(r, ["oriRuta"]);
    const rDes = getField(r, ["desRuta"]);
    
    if (rNom && rOri && rDes) return `${rNom} (${rOri} → ${rDes})`;
    return rNom || `Ruta#${idRuta}`;
  };

  // ============================
  // Funciones de carga de datos
  // ============================
  const showMessage = (message, type = "info") => {
    if (type === "error") {
      setError(message);
      setSuccess("");
    } else {
      setSuccess(message);
      setError("");
    }
    
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 5000);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    
    try {
      await Promise.all([
        fetchViajes(),
        fetchVehiculos(),
        fetchConductores(),
        fetchRutas()
      ]);
    } catch (err) {
      console.error("Error cargando datos:", err);
      showMessage("Error cargando los datos del sistema", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchViajes = async () => {
    try {
      const res = await apiClient.get("/api/viajes");
      const data = Array.isArray(res.data) ? res.data : (res.data?.viajes ?? res.data);
      setViajes(data || []);
      return data || [];
    } catch (err) {
      console.error("Error cargando viajes", err);
      setViajes([]);
      throw err;
    }
  };

  const fetchVehiculos = async () => {
    try {
      const res = await apiClient.get("/api/vehiculos");
      setVehiculos(Array.isArray(res.data) ? res.data : (res.data?.vehiculos ?? []));
    } catch (err) {
      console.error("Error cargando vehículos", err);
      setVehiculos([]);
      throw err;
    }
  };

  const fetchConductores = async () => {
    try {
      const res = await apiClient.get("/api/conductores");
      setConductores(Array.isArray(res.data) ? res.data : (res.data?.conductores ?? []));
    } catch (err) {
      console.error("Error cargando conductores", err);
      setConductores([]);
      throw err;
    }
  };

  const fetchRutas = async () => {
    try {
      const res = await apiClient.get("/api/rutas/utils/select");
      setRutas(Array.isArray(res.data) ? res.data : (res.data?.rutas ?? []));
    } catch (err) {
      console.error("Error cargando rutas", err);
      setRutas([]);
      throw err;
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // ============================
  // CRUD de viajes
  // ============================
  const onInput = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      idVehiculo: "",
      idConductor: "",
      idRuta: "",
      fecHorSalViaje: "",
      fecHorLleViaje: "",
      estViaje: "PROGRAMADO",
      obsViaje: "",
    });
  };

  const openCreate = () => {
    setEditId(null);
    resetForm();
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const openEdit = (v) => {
    setEditId(getField(v, ["idViaje", "id_viaje", "id"]));
    setFormData({
      idVehiculo: getField(v, ["idVehiculo", "id_vehiculo"]) || "",
      idConductor: getField(v, ["idConductor", "id_conductor"]) || "",
      idRuta: getField(v, ["idRuta", "id_ruta"]) || "",
      fecHorSalViaje: formatForInput(getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fechaSalida", "salida"])),
      fecHorLleViaje: formatForInput(getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fechaLlegada", "llegada"])),
      estViaje: getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO",
      obsViaje: getField(v, ["obsViaje", "observaciones"]) || "",
    });
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este viaje?")) return;
    
    try {
      setLoading(true);
      await apiClient.delete(`/api/viajes/${id}`);
      await fetchViajes();
      showMessage("Viaje eliminado exitosamente", "success");
    } catch (err) {
      console.error("Error eliminando viaje", err);
      const message = err.response?.data?.message || "No se pudo eliminar el viaje";
      showMessage(message, "error");
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.idVehiculo) errors.push("Selecciona un vehículo");
    if (!formData.idConductor) errors.push("Selecciona un conductor");
    if (!formData.idRuta) errors.push("Selecciona una ruta");
    if (!formData.fecHorSalViaje) errors.push("Ingresa la fecha y hora de salida");
    
    // Validar que la fecha de salida no sea pasada (solo para nuevos viajes)
    if (!editId && formData.fecHorSalViaje) {
      const now = new Date();
      const salida = new Date(formData.fecHorSalViaje);
      if (salida < now) {
        errors.push("La fecha de salida debe ser futura");
      }
    }
    
    // Validar que la llegada sea posterior a la salida
    if (formData.fecHorSalViaje && formData.fecHorLleViaje) {
      const salida = new Date(formData.fecHorSalViaje);
      const llegada = new Date(formData.fecHorLleViaje);
      if (llegada <= salida) {
        errors.push("La fecha de llegada debe ser posterior a la salida");
      }
    }
    
    return errors;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      showMessage(validationErrors.join(". "), "error");
      return;
    }
    
    setSubmitting(true);
    setError("");
    setSuccess("");
    
    const payload = {
      idVehiculo: parseInt(formData.idVehiculo),
      idConductor: parseInt(formData.idConductor),
      idRuta: parseInt(formData.idRuta),
      fecHorSalViaje: formatForApi(formData.fecHorSalViaje),
      fecHorLleViaje: formData.fecHorLleViaje ? formatForApi(formData.fecHorLleViaje) : null,
      estViaje: formData.estViaje,
      obsViaje: formData.obsViaje || null,
    };

    try {
      if (editId) {
        await apiClient.put(`/api/viajes/${editId}`, payload);
        showMessage("Viaje actualizado exitosamente", "success");
      } else {
        await apiClient.post("/api/viajes", payload);
        showMessage("Viaje creado exitosamente", "success");
      }
      
      setShowModal(false);
      resetForm();
      await fetchViajes();
    } catch (err) {
      console.error("Error guardando viaje", err);
      const message = err.response?.data?.message || "Error guardando el viaje";
      showMessage(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // ============================
  // Filtrado y renderizado
  // ============================
  const filtered = viajes.filter((v) => {
    const rutaLabel = getRutaLabel(v).toLowerCase();
    const condLabel = getConductorLabel(v).toLowerCase();
    const vehLabel = getVehicleLabel(v).toLowerCase();
    const search = filtroRuta.toLowerCase();
    
    const matchesSearch = !search || 
      rutaLabel.includes(search) || 
      condLabel.includes(search) || 
      vehLabel.includes(search);
    
    const estado = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
    const matchesEstado = filtroEstado === "all" || estado === filtroEstado;
    
    return matchesSearch && matchesEstado;
  });

  const getStatusClass = (s) => {
    switch (s) {
      case "PROGRAMADO":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "EN_CURSO":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "FINALIZADO":
        return "bg-green-50 text-green-700 border-green-200";
      case "CANCELADO":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (s) => {
    switch (s) {
      case "PROGRAMADO":
        return <Clock className="w-3 h-3" />;
      case "EN_CURSO":
        return <Loader className="w-3 h-3 animate-spin" />;
      case "FINALIZADO":
        return <CheckCircle className="w-3 h-3" />;
      case "CANCELADO":
        return <X className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  // ============================
  // JSX
  // ============================
  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl shadow-sm m-6">
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-indigo-600 mr-3" />
          <span className="text-lg text-gray-600">Cargando datos del sistema...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-white rounded-xl shadow-sm m-4 lg:m-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl lg:text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="text-indigo-600 w-6 h-6 lg:w-7 lg:h-7" />
          Horarios de Servicio
          <span className="text-sm lg:text-base font-normal text-gray-500 ml-2">
            ({filtered.length} viajes)
          </span>
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
            <span className="sm:hidden">Viaje</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span className="text-sm">{success}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 flex-grow">
          <Search className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Buscar por ruta, conductor o vehículo..."
            className="border-none bg-transparent w-full text-sm text-gray-800 outline-none"
            value={filtroRuta}
            onChange={(e) => setFiltroRuta(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white min-w-32"
          >
            <option value="all">Todos los estados</option>
            <option value="PROGRAMADO">Programado</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="FINALIZADO">Finalizado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Table - Responsive */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left font-medium text-gray-700 min-w-32">Ruta</th>
              <th className="p-3 text-left font-medium text-gray-700 min-w-32 hidden sm:table-cell">Conductor</th>
              <th className="p-3 text-left font-medium text-gray-700 min-w-32 hidden md:table-cell">Vehículo</th>
              <th className="p-3 text-left font-medium text-gray-700 min-w-40">Salida</th>
              <th className="p-3 text-left font-medium text-gray-700 min-w-40 hidden lg:table-cell">Llegada</th>
              <th className="p-3 text-left font-medium text-gray-700 min-w-28">Estado</th>
              <th className="p-3 text-center font-medium text-gray-700 w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((v, i) => {
                const id = getField(v, ["idViaje", "id_viaje", "id"]);
                const status = getField(v, ["estViaje", "estado", "estatus"]) || "PROGRAMADO";
                const salida = getField(v, ["fecHorSalViaje", "fec_hor_sal_viaje", "fecSal"]) || "";
                const llegada = getField(v, ["fecHorLleViaje", "fec_hor_lle_viaje", "fecLle"]) || "";
                
                return (
                  <tr key={id || i} className={i % 2 === 0 ? "bg-white hover:bg-gray-50" : "bg-gray-50 hover:bg-gray-100"}>
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{getRutaLabel(v)}</div>
                      <div className="sm:hidden text-xs text-gray-500 mt-1">
                        {getConductorLabel(v)} • {getVehicleLabel(v)}
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">{getConductorLabel(v)}</td>
                    <td className="p-3 hidden md:table-cell">{getVehicleLabel(v)}</td>
                    <td className="p-3">
                      <div className="text-gray-900">{parseDateForDisplay(salida)}</div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      {llegada ? (
                        <div className="text-gray-900">{parseDateForDisplay(llegada)}</div>
                      ) : (
                        <span className="text-gray-400 text-xs">No programada</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(status)}`}>
                        {getStatusIcon(status)}
                        <span className="hidden sm:inline">{status}</span>
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-center gap-1">
                        <button 
                          onClick={() => openEdit(v)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar viaje"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => onDelete(id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar viaje"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-8 h-8 text-gray-300" />
                    <span>No hay viajes registrados</span>
                    {filtroRuta || filtroEstado !== "all" ? (
                      <button
                        onClick={() => {
                          setFiltroRuta("");
                          setFiltroEstado("all");
                        }}
                        className="text-indigo-600 hover:text-indigo-700 text-sm"
                      >
                        Limpiar filtros
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Crear/Editar - Responsive */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative max-h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                {editId ? "Editar Viaje" : "Nuevo Viaje"}
              </h3>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehículo *
                </label>
                <select 
                  name="idVehiculo" 
                  value={formData.idVehiculo} 
                  onChange={onInput} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required
                >
                  <option value="">Seleccione Vehículo</option>
                  {vehiculos.map((v) => (
                    <option key={getField(v, ["idVehiculo", "id"])} value={getField(v, ["idVehiculo", "id"])}>
                      {getField(v, ["placaVehiculo", "plaVehiculo", "placa"]) || getField(v, ["numVehiculo"])} 
                      {getField(v, ["modeloVehiculo"]) ? ` - ${getField(v, ["modeloVehiculo"])}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductor *
                </label>
                <select 
                  name="idConductor" 
                  value={formData.idConductor} 
                  onChange={onInput} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required
                >
                  <option value="">Seleccione Conductor</option>
                  {conductores.map((c) => (
                    <option key={getField(c, ["idConductor", "id"])} value={getField(c, ["idConductor", "id"])}>
                      {(getField(c, ["nombreConductor", "nomConductor", "nom"]) || "")} {(getField(c, ["apellidoConductor", "apeConductor", "ape"]) || "")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ruta *
                </label>
                <select 
                  name="idRuta" 
                  value={formData.idRuta} 
                  onChange={onInput} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  required
                >
                  <option value="">Seleccione Ruta</option>
                  {rutas.map((r) => (
                    <option key={getField(r, ["idRuta", "id"])} value={getField(r, ["idRuta", "id"])}>
                      {getField(r, ["nomRuta", "nombreRuta"])} 
                      {getField(r, ["oriRuta"]) ? ` — ${getField(r, ["oriRuta"])} → ${getField(r, ["desRuta"])}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Salida *
                  </label>
                  <input 
                    type="datetime-local" 
                    name="fecHorSalViaje" 
                    value={formData.fecHorSalViaje} 
                    onChange={onInput} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                    required 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora de Llegada
                  </label>
                  <input 
                    type="datetime-local" 
                    name="fecHorLleViaje" 
                    value={formData.fecHorLleViaje} 
                    onChange={onInput} 
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado del Viaje
                </label>
                <select 
                  name="estViaje" 
                  value={formData.estViaje} 
                  onChange={onInput} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="PROGRAMADO">PROGRAMADO</option>
                  <option value="EN_CURSO">EN_CURSO</option>
                  <option value="FINALIZADO">FINALIZADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea 
                  name="obsViaje" 
                  value={formData.obsViaje} 
                  onChange={onInput} 
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Observaciones adicionales..."
                  rows="3"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting && <Loader className="w-4 h-4 animate-spin" />}
                  {editId ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Horarios;