import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { 
  FaLock, 
  FaEnvelope, 
  FaExclamationTriangle, 
  FaEye, 
  FaEyeSlash,
  FaUserTie,
  FaCheckCircle,
  FaShieldAlt,
  FaUsers,
  FaCogs,
  FaSpinner
} from "react-icons/fa";

// Importar el servicio de autenticación
import authAPI from '../utilidades/authAPI';

const Register = () => {
  const navigate = useNavigate();
  
  // Estados simplificados
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  
  const [ui, setUI] = useState({
    formErrors: {},
    loading: false,
    error: "",
    success: "",
    formTouched: false,
    showPassword: false,
    showConfirmPassword: false
  });

  // Funciones de utilidad
  const updateUI = (updates) => setUI(prev => ({ ...prev, ...updates }));
  
  const clearMessages = () => updateUI({ error: "", success: "" });

  // Validación de campos
  const validateField = (name, value) => {
    const validators = {
      email: (val) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(val) ? "Ingrese un correo electrónico válido" : "";
      },
      password: (val) => {
        if (val.length < 6) return "La contraseña debe tener al menos 6 caracteres";
        if (!/(?=.*[a-z])/.test(val)) return "Debe incluir al menos una minúscula";
        if (!/(?=.*[A-Z])/.test(val)) return "Debe incluir al menos una mayúscula";
        if (!/(?=.*\d)/.test(val)) return "Debe incluir al menos un número";
        if (!/(?=.*[\W_])/.test(val)) return "Debe incluir al menos un símbolo";
        return "";
      },
      confirmPassword: (val) => {
        return val !== formData.password ? "Las contraseñas no coinciden" : "";
      }
    };
    
    return validators[name]?.(value) || "";
  };

  // Manejo de cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    const fieldError = validateField(name, value);
    updateUI({
      formTouched: true,
      formErrors: { ...ui.formErrors, [name]: fieldError }
    });
    
    clearMessages();
  };

  // Validación completa del formulario
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
        isValid = false;
      }
    });
    
    updateUI({ formErrors: errors });
    return isValid;
  };

  // Manejo del registro
  const handleRegister = async (e) => {
    e.preventDefault();
    updateUI({ formTouched: true });
    
    if (!validateForm()) return;
    
    clearMessages();
    updateUI({ loading: true });

    try {
      await authAPI.register({
        email: formData.email.trim(),
        password: formData.password
      });

      updateUI({ 
        success: "¡Registro exitoso! Por favor, verifica tu correo electrónico para completar el registro.",
        loading: false 
      });
      
      // Limpiar formulario
      setFormData({ email: "", password: "", confirmPassword: "" });
      updateUI({ formTouched: false, formErrors: {} });
      
      // Redirigir después de un momento
      setTimeout(() => navigate("/login"), 3000);
      
    } catch (error) {
      console.error("Error de registro:", error);
      updateUI({ 
        error: error.message || "Error al registrar usuario. Intente nuevamente.",
        loading: false 
      });
    }
  };

  // Toggle de visibilidad de contraseña
  const togglePasswordVisibility = (field) => {
    const key = field === 'password' ? 'showPassword' : 'showConfirmPassword';
    updateUI({ [key]: !ui[key] });
  };

  // Cálculo de fortaleza de contraseña
  const getPasswordStrength = () => {
    const { password } = formData;
    if (!password) return { score: 0, label: "", color: "" };
    
    const checks = [
      password.length >= 8,
      /(?=.*[a-z])/.test(password),
      /(?=.*[A-Z])/.test(password),
      /(?=.*\d)/.test(password),
      /(?=.*[\W_])/.test(password)
    ];
    
    const score = checks.filter(Boolean).length;
    
    if (score < 3) return { score, label: "Débil", color: "text-red-500" };
    if (score < 5) return { score, label: "Media", color: "text-yellow-500" };
    return { score, label: "Fuerte", color: "text-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  // Componente para mostrar requisitos de contraseña
  const PasswordRequirement = ({ met, children }) => (
    <div className={`flex items-center text-sm ${met ? "text-green-600" : "text-slate-500"}`}>
      <FaCheckCircle className={`mr-3 ${met ? "text-green-500" : "text-slate-300"}`} />
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col xl:flex-row min-h-[80vh]">
          {/* Left side - Brand section */}
          <div className="xl:w-2/5 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 lg:p-12 xl:p-16 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-white/5 to-transparent rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl xl:text-5xl font-bold text-white mb-6">
                TransSync
              </h1>
              <p className="text-blue-100 text-xl mb-10 leading-relaxed">
                Sistema de gestión empresarial para el transporte moderno
              </p>
              <div className="space-y-6">
                <div className="flex items-center text-blue-100 text-lg">
                  <FaShieldAlt className="mr-4 text-blue-300 text-xl" />
                  <span>Registro seguro y verificado</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaUsers className="mr-4 text-blue-300 text-xl" />
                  <span>Asignación de roles por administrador</span>
                </div>
                <div className="flex items-center text-blue-100 text-lg">
                  <FaCogs className="mr-4 text-blue-300 text-xl" />
                  <span>Acceso controlado al sistema</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form section */}
          <div className="xl:w-3/5 p-8 lg:p-12 xl:p-16 flex flex-col justify-center">
            {/* Header */}
            <div className="text-center mb-10">
              <h2 className="text-3xl xl:text-4xl font-bold text-slate-800 mb-3">Crear Cuenta</h2>
              <p className="text-slate-600 text-lg">Regístrese para acceder al sistema</p>
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-center text-blue-700 text-sm">
                  <FaUserTie className="mr-2 text-blue-600" />
                  <span className="font-medium">Su cuenta será revisada por un administrador antes de la activación</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            {ui.success && (
              <div className="flex items-center bg-green-50 text-green-700 p-4 rounded-xl mb-8 border border-green-200">
                <FaCheckCircle className="mr-3 flex-shrink-0 text-green-500 text-lg" />
                <span className="text-sm">{ui.success}</span>
              </div>
            )}

            {ui.error && (
              <div className="flex items-center bg-red-50 text-red-700 p-4 rounded-xl mb-8 border border-red-200">
                <FaExclamationTriangle className="mr-3 flex-shrink-0 text-red-500 text-lg" />
                <div className="text-sm">
                  <p>{ui.error}</p>
                  {ui.error.includes("configuración del sistema") && (
                    <p className="mt-2 text-red-600 font-medium">
                      Sugerencia: Contacte al administrador del sistema para verificar la configuración de la base de datos.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleRegister} className="space-y-8">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-3">
                  Correo electrónico
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Ingrese su correo electrónico"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-4 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg disabled:opacity-50 ${
                      ui.formTouched && ui.formErrors.email 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    required
                    autoComplete="email"
                  />
                </div>
                {ui.formTouched && ui.formErrors.email && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-3">
                  Contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="password"
                    name="password"
                    type={ui.showPassword ? "text" : "password"}
                    placeholder="Cree una contraseña segura"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg disabled:opacity-50 ${
                      ui.formTouched && ui.formErrors.password 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => togglePasswordVisibility('password')}
                    disabled={ui.loading}
                    tabIndex="-1"
                  >
                    {ui.showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-600">Fortaleza:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score < 3 ? 'bg-red-500' :
                          passwordStrength.score < 5 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
                
                {ui.formTouched && ui.formErrors.password && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-3">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-lg" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={ui.showConfirmPassword ? "text" : "password"}
                    placeholder="Confirme su contraseña"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={ui.loading}
                    className={`w-full pl-12 pr-12 py-4 border rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:bg-white transition-all duration-200 text-lg disabled:opacity-50 ${
                      ui.formTouched && ui.formErrors.confirmPassword 
                        ? "border-red-500 focus:ring-2 focus:ring-red-500" 
                        : "border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    }`}
                    required
                    autoComplete="new-password"
                  />
                  <button 
                    type="button" 
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => togglePasswordVisibility('confirmPassword')}
                    disabled={ui.loading}
                    tabIndex="-1"
                  >
                    {ui.showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {ui.formTouched && ui.formErrors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-2 flex items-center">
                    <FaExclamationTriangle className="mr-2 text-red-500" />
                    {ui.formErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Password requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="text-sm font-medium text-slate-700 mb-4">Requisitos de contraseña:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <PasswordRequirement met={formData.password.length >= 8}>
                    Mínimo 8 caracteres
                  </PasswordRequirement>
                  <PasswordRequirement met={/(?=.*[a-z])/.test(formData.password)}>
                    Una minúscula
                  </PasswordRequirement>
                  <PasswordRequirement met={/(?=.*[A-Z])/.test(formData.password)}>
                    Una mayúscula
                  </PasswordRequirement>
                  <PasswordRequirement met={/(?=.*\d)/.test(formData.password)}>
                    Un número
                  </PasswordRequirement>
                  <PasswordRequirement met={/(?=.*[\W_])/.test(formData.password)}>
                    Un símbolo
                  </PasswordRequirement>
                </div>
              </div>

              {/* Information about process */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <FaUserTie className="mr-2" />
                  Proceso de registro
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  {[
                    'Se creará su cuenta con estado "PENDIENTE"',
                    'Recibirá un correo de verificación',
                    'Un administrador revisará y asignará su rol final'
                  ].map((step, index) => (
                    <div key={index} className="flex items-start">
                      <span className="inline-block w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5 font-bold">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit button */}
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-lg"
                disabled={ui.loading}
              >
                {ui.loading ? (
                  <div className="flex items-center justify-center">
                    <FaSpinner className="w-6 h-6 mr-3 animate-spin" />
                    Registrando...
                  </div>
                ) : (
                  'Crear Cuenta'
                )}
              </button>

              {/* Login link */}
              <div className="text-center pt-6 border-t border-slate-200">
                <p className="text-slate-600 text-base mb-4">¿Ya tienes una cuenta?</p>
                <button 
                  type="button" 
                  className="w-full sm:w-auto bg-white text-blue-600 border-2 border-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700 font-semibold py-3 px-8 rounded-xl transition-all duration-200 text-base disabled:opacity-50"
                  onClick={() => navigate("/login")}
                  disabled={ui.loading}
                >
                  Iniciar sesión
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;