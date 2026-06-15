import React, { useState, useEffect } from "react";
import { X, Sliders, Save, Moon, Volume2, Camera, Fingerprint, User, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useSound } from "../../context/SoundContext";
import { obtenerConfiguracionEscritorio, actualizarConfiguracionEscritorio } from "../../services/configuracionEscritorioService";
import { obtenerEscritorioIdGuardado } from "../../services/escritorioService";
import DynamicLoader from "../common/DynamicLoader";
// Mapeo de claves del backend a info visual del frontend
const METODOS_AUTH_INFO = {
  facial: { icon: Camera, label: "Reconocimiento Facial", color: "text-amber-600 dark:text-amber-400" },
  dactilar: { icon: Fingerprint, label: "Huella Digital", color: "text-green-600 dark:text-green-400" },
  pin: { icon: User, label: "Usuario/Correo", color: "text-purple-600 dark:text-purple-400" },
};

export default function PreferenciasModal({ onClose, onBack, inline = false }) {
  const { isDarkMode, setDarkMode, colorTheme, setColorTheme } = useTheme();
  const { soundEnabled, setSoundEnabled, setSoundVolume } = useSound();
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [showMinMethodWarning, setShowMinMethodWarning] = useState(false);

  // Estado para datos del backend
  const [metodosAuth, setMetodosAuth] = useState(null);
  const [loadingCredenciales, setLoadingCredenciales] = useState(true);
  const [errorCredenciales, setErrorCredenciales] = useState(null);
  const [savingCredenciales, setSavingCredenciales] = useState(false);

  // Preferencias locales (darkMode, sound)
  const defaultPreferences = {
    darkMode: false,
    colorTheme: 'orange',
    soundEnabled: true,
    soundVolume: 1,
  };

  const [preferences, setPreferences] = useState(() => {
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        return {
          darkMode: isDarkMode,
          colorTheme: colorTheme,
          soundEnabled: parsed.soundEnabled ?? defaultPreferences.soundEnabled,
          soundVolume: parsed.soundVolume ?? defaultPreferences.soundVolume,
        };
      } catch (error) {
        // Error al cargar, se usa el retorno por defecto
      }
    }
    return {
      ...defaultPreferences,
      darkMode: isDarkMode,
      colorTheme: colorTheme,
    };
  });

  useEffect(() => {
    setPreferences(prev => ({ ...prev, darkMode: isDarkMode, colorTheme: colorTheme }));
  }, [isDarkMode, colorTheme]);

  // Cargar metodos de credenciales desde el backend (configuración del dispositivo)
  useEffect(() => {
    const cargarCredenciales = async () => {
      try {
        setLoadingCredenciales(true);
        setErrorCredenciales(null);
        const escritorioId = obtenerEscritorioIdGuardado();
        if (!escritorioId) throw new Error("No se encontró el ID del dispositivo.");

        const configuracion = await obtenerConfiguracionEscritorio(escritorioId);

        let metodos = configuracion.metodos_autenticacion;
        // Parsear si viene como string
        if (typeof metodos === 'string') {
          metodos = JSON.parse(metodos);
        }

        let prioridad = configuracion.prioridad_biometrico;
        if (typeof prioridad === 'string') {
          prioridad = JSON.parse(prioridad);
        }

        const keyMap = { huella: 'dactilar', rostro: 'facial', codigo: 'pin' };
        let initialMetodos = [];

        if (Array.isArray(prioridad) && prioridad.length > 0) {
          prioridad.sort((a, b) => a.nivel - b.nivel);
          initialMetodos = prioridad.map(item => ({
            id: keyMap[item.metodo],
            activo: item.activo
          })).filter(item => item.id);
        } else {
          // Fallback
          initialMetodos = [
            { id: 'facial', activo: metodos?.rostro ?? true },
            { id: 'dactilar', activo: metodos?.huella ?? true },
            { id: 'pin', activo: metodos?.codigo ?? true }
          ];
        }

        setMetodosAuth(initialMetodos);

      } catch (err) {
        console.error("Error al cargar metodos de autenticación del dispositivo:", err);
        setErrorCredenciales(err.message);
      } finally {
        setLoadingCredenciales(false);
      }
    };

    cargarCredenciales();
  }, []);

  const handleDarkModeToggle = (checked) => {
    setPreferences({ ...preferences, darkMode: checked });
    setDarkMode(checked);
  };

  const handleColorThemeToggle = (themeName) => {
    setPreferences({ ...preferences, colorTheme: themeName });
    setColorTheme(themeName);
  };

  // --- Métodos de autenticación (backend) ---

  const getMetodosArr = () => {
    if (!metodosAuth) return [];
    if (Array.isArray(metodosAuth)) return metodosAuth;
    return Object.values(metodosAuth);
  };

  const handleCheckMethodToggle = (metodoId) => {
    if (!Array.isArray(metodosAuth)) return;

    // Verificar que quede al menos un método activo
    const activosCount = metodosAuth.filter(m => m.activo).length;
    const metodoIndex = metodosAuth.findIndex(m => m.id === metodoId);
    if (metodoIndex === -1) return;
    const estaActivo = metodosAuth[metodoIndex].activo;

    if (estaActivo && activosCount <= 1) {
      setShowMinMethodWarning(true);
      setTimeout(() => setShowMinMethodWarning(false), 2500);
      return;
    }

    setMetodosAuth(prev => prev.map(m =>
      m.id === metodoId ? { ...m, activo: !m.activo } : m
    ));
  };

  const moveMethodUp = (index) => {
    if (index === 0) return;
    setMetodosAuth(prev => {
      const newArr = [...prev];
      const temp = newArr[index - 1];
      newArr[index - 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  const moveMethodDown = (index) => {
    if (!Array.isArray(metodosAuth) || index === metodosAuth.length - 1) return;
    setMetodosAuth(prev => {
      const newArr = [...prev];
      const temp = newArr[index + 1];
      newArr[index + 1] = newArr[index];
      newArr[index] = temp;
      return newArr;
    });
  };

  const handleSave = async () => {
    // Guardar preferencias locales
    localStorage.setItem("userPreferences", JSON.stringify(preferences));

    // Guardar configuracion de metodos en el backend
    if (metodosAuth) {
      try {
        setSavingCredenciales(true);
        const escritorioId = obtenerEscritorioIdGuardado();

        // Mapear de vuelta al formato del backend para guardar
        const backKeyMap = { dactilar: 'huella', facial: 'rostro', pin: 'codigo' };

        const metodosBackend = {
          huella: metodosAuth.find(m => m.id === 'dactilar')?.activo ?? true,
          rostro: metodosAuth.find(m => m.id === 'facial')?.activo ?? true,
          codigo: metodosAuth.find(m => m.id === 'pin')?.activo ?? true
        };

        const prioridadBackend = metodosAuth.map((m, index) => ({
          metodo: backKeyMap[m.id],
          activo: m.activo,
          nivel: index + 1
        }));

        if (escritorioId) {
          await actualizarConfiguracionEscritorio(escritorioId, {
            metodos_autenticacion: metodosBackend,
            prioridad_biometrico: prioridadBackend
          });

          // Emitir evento para que otros componentes (ej. KioskScreen) se actualicen en tiempo real
          window.dispatchEvent(new CustomEvent('configuracion-actualizada'));
        }
      } catch (err) {
        console.error("Error al guardar metodos de autenticación:", err);
        // Aún así mostrar mensaje de éxito parcial (las locales se guardaron)
      } finally {
        setSavingCredenciales(false);
      }
    }

    setShowSaveMessage(true);
    setTimeout(() => {
      setShowSaveMessage(false);
      onClose();
    }, 1500);
  };

  const metodosList = getMetodosArr();
  const totalMetodos = metodosList.length;

  return (
    <div className={inline ? "w-full h-full flex flex-col" : "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"}>
      {showSaveMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <Save className="w-5 h-5" />
          <span className="font-semibold">Preferencias guardadas exitosamente</span>
        </div>
      )}
      {showMinMethodWarning && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] bg-amber-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-pulse">
          <Sliders className="w-5 h-5" />
          <span className="font-semibold">Debe haber al menos un método de checado activo</span>
        </div>
      )}
      <div className={inline ? "flex-1 flex flex-col overflow-y-auto" : "bg-bg-primary rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"}>
        {/* Header */}
        <div className={`bg-bg-primary p-6 border-b border-border-subtle flex-shrink-0 ${inline ? 'sticky top-0 z-10' : ''}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Sliders className="w-8 h-8 text-accent" />
              <div>
                <h3 className="text-2xl font-bold text-text-primary">Preferencias</h3>
                <p className="text-text-secondary text-sm mt-1">
                  Personaliza tu experiencia y ajustes del usuario
                </p>
              </div>
            </div>
            {!inline && (
              <button
                onClick={onClose}
                className="text-text-secondary hover:bg-bg-secondary rounded-lg p-2 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            )}
            {inline && (
              <button
                onClick={handleSave}
                disabled={savingCredenciales}
                className="px-5 py-2.5 text-sm bg-accent text-white rounded-xl font-bold hover:bg-accent-hover transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {savingCredenciales ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingCredenciales ? "Guardando..." : "Guardar Cambios"}
              </button>
            )}
          </div>
        </div>

        {/* Body - Scrollable */}
        {loadingCredenciales ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <DynamicLoader text="Cargando preferencias..." size="medium" />
          </div>
        ) : (
          <div className="p-3 space-y-4 flex-1 overflow-y-auto">

            {/* Tema Visual */}
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-4">
              <h4 className="font-semibold text-text-primary text-sm mb-1">Tema del panel</h4>
              <p className="text-xs text-text-secondary mb-4">
                El tema se guarda en tu navegador y no afecta a otros usuarios.
              </p>

              {/* Selector de Color */}
              <div className="mb-4">
                <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2 block">Color de Acento</span>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleColorThemeToggle('orange')}
                    className={`w-8 h-8 rounded-full bg-[#f59e0b] ring-2 ring-offset-2 dark:ring-offset-[#1E1E1C] ring-offset-[#f5f5f7] transition-all ${preferences.colorTheme === 'orange' ? 'ring-[#f59e0b] scale-110' : 'ring-transparent opacity-50 hover:opacity-100'}`}
                    title="Naranja (Ámbar)"
                  />
                  <button
                    onClick={() => handleColorThemeToggle('blue')}
                    className={`w-8 h-8 rounded-full bg-[#0071E3] ring-2 ring-offset-2 dark:ring-offset-[#1E1E1C] ring-offset-[#f5f5f7] transition-all ${preferences.colorTheme === 'blue' ? 'ring-[#0071E3] scale-110' : 'ring-transparent opacity-50 hover:opacity-100'}`}
                    title="Azul Clásico"
                  />
                </div>
              </div>

              {/* Tarjetas Modo Claro/Oscuro */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dark Mode Card */}
                <div
                  onClick={() => handleDarkModeToggle(true)}
                  className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all flex flex-col ${preferences.darkMode ? 'border-accent shadow-md shadow-accent/10' : 'border-border-subtle opacity-70 hover:opacity-100'}`}
                >
                  <div className="h-28 bg-[#111110] p-3 flex gap-2">
                    {/* Skeleton Sidebar */}
                    <div className="w-12 h-full border-r border-[#2e2e2b] flex flex-col gap-2">
                      <div className={`w-8 h-3 rounded-full mb-1 ${preferences.colorTheme === 'orange' ? 'bg-[#f59e0b]' : 'bg-[#1976D2]'}`}></div>
                      <div className="w-8 h-2 bg-[#2e2e2b] rounded-full"></div>
                      <div className="w-8 h-2 bg-[#2e2e2b] rounded-full"></div>
                      <div className="w-8 h-2 bg-[#2e2e2b] rounded-full"></div>
                    </div>
                    {/* Skeleton Content */}
                    <div className="flex-1 flex flex-col gap-2 pt-1">
                      <div className="w-full h-4 border border-[#2e2e2b] bg-[#1e1e1c] rounded-md"></div>
                      <div className="w-3/4 h-4 border border-[#2e2e2b] bg-[#1e1e1c] rounded-md"></div>
                      <div className="w-full h-4 border border-[#2e2e2b] bg-[#1e1e1c] rounded-md mt-2"></div>
                    </div>
                  </div>
                  <div className="bg-bg-primary p-3 flex items-center justify-between border-t border-border-subtle flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${preferences.darkMode ? 'border-accent bg-transparent' : 'border-text-disabled'}`}>
                        {preferences.darkMode && <div className="w-2.5 h-2.5 bg-accent rounded-full"></div>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Modo Oscuro</p>
                        <p className="text-[10px] text-text-secondary leading-tight mt-0.5 pr-2">Ideal para sesiones largas y poca luz ambiental</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Light Mode Card */}
                <div
                  onClick={() => handleDarkModeToggle(false)}
                  className={`cursor-pointer border-2 rounded-xl overflow-hidden transition-all flex flex-col ${!preferences.darkMode ? 'border-accent shadow-md shadow-accent/10' : 'border-border-subtle opacity-70 hover:opacity-100'}`}
                >
                  <div className="h-28 bg-[#f8fafc] p-3 flex gap-2">
                    {/* Skeleton Sidebar */}
                    <div className="w-12 h-full border-r border-[#e2e8f0] flex flex-col gap-2">
                      <div className={`w-8 h-3 rounded-full mb-1 ${preferences.colorTheme === 'orange' ? 'bg-[#f59e0b]' : 'bg-[#0071E3]'}`}></div>
                      <div className="w-8 h-2 bg-[#e2e8f0] rounded-full"></div>
                      <div className="w-8 h-2 bg-[#e2e8f0] rounded-full"></div>
                      <div className="w-8 h-2 bg-[#e2e8f0] rounded-full"></div>
                    </div>
                    {/* Skeleton Content */}
                    <div className="flex-1 flex flex-col gap-2 pt-1">
                      <div className="w-full h-4 border border-[#e2e8f0] bg-white rounded-md shadow-sm"></div>
                      <div className="w-3/4 h-4 border border-[#e2e8f0] bg-white rounded-md shadow-sm"></div>
                      <div className="w-full h-4 border border-[#e2e8f0] bg-white rounded-md mt-2 shadow-sm"></div>
                    </div>
                  </div>
                  <div className="bg-bg-primary p-3 flex items-center justify-between border-t border-border-subtle flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!preferences.darkMode ? 'border-accent bg-accent' : 'border-text-disabled'}`}>
                        {!preferences.darkMode && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary">Modo Claro</p>
                        <p className="text-[10px] text-text-secondary leading-tight mt-0.5 pr-2">Óptimo para ambientes bien iluminados y presentaciones</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Sonido y Volumen */}
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-3">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-accent" />
                    <div>
                      <h4 className="font-semibold text-text-primary text-sm">Sonidos del Sistema</h4>
                      <p className="text-xs text-text-secondary">
                        Activar alertas sonoras y guías auditivas
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.soundEnabled}
                      onChange={(e) => {
                        const enabled = e.target.checked;
                        setPreferences({
                          ...preferences,
                          soundEnabled: enabled,
                        });
                        if (setSoundEnabled) setSoundEnabled(enabled);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg-primary after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                  </label>
                </div>

                {/* Slider de Volumen */}
                {preferences.soundEnabled && (
                  <div className="pt-2 border-t border-border-subtle">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-text-primary font-medium">Volumen de Voz</span>
                      <span className="text-xs text-text-secondary">{Math.round(preferences.soundVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={preferences.soundVolume}
                      onChange={(e) => {
                        const volume = parseFloat(e.target.value);
                        setPreferences({
                          ...preferences,
                          soundVolume: volume,
                        });
                        if (setSoundVolume) setSoundVolume(volume);
                      }}
                      className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer accent-accent"
                      style={{
                        backgroundImage: `linear-gradient(to right, rgb(var(--accent)) ${preferences.soundVolume * 100}%, transparent ${preferences.soundVolume * 100}%)`
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Métodos de Checado */}
            <div className="bg-bg-secondary border border-border-subtle rounded-xl p-3">
              <h4 className="font-semibold text-text-primary mb-3 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-accent" />
                Métodos de Checado de Asistencia
              </h4>
              <p className="text-xs text-text-secondary mb-3">
                Configura qué métodos estarán disponibles en la pantalla de checado y su orden de aparición
              </p>

              {errorCredenciales ? (
                <div className="text-center py-4 text-red-500 text-sm">
                  <p>Error al cargar los métodos de autenticación</p>
                  <p className="text-xs mt-1 text-text-secondary">{errorCredenciales}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {metodosList.map((metodo, index) => {
                    const metodoInfo = METODOS_AUTH_INFO[metodo.id] || {
                      icon: User,
                      label: metodo.id,
                      color: "text-gray-600 dark:text-gray-400",
                    };
                    const Icon = metodoInfo.icon;

                    return (
                      <div
                        key={metodo.id}
                        className="flex items-center gap-2 bg-bg-primary rounded-lg p-2 border border-border-subtle"
                      >
                        {/* Controles para cambiar la prioridad */}
                        <div className="flex flex-col gap-0 border-r border-border-subtle pr-2 mr-1">
                          <button
                            onClick={() => moveMethodUp(index)}
                            disabled={index === 0}
                            className={`p-0.5 rounded ${index === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-text-secondary hover:text-accent hover:bg-bg-secondary'}`}
                            title="Aumentar prioridad"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => moveMethodDown(index)}
                            disabled={index === metodosList.length - 1}
                            className={`p-0.5 rounded ${index === metodosList.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-text-secondary hover:text-accent hover:bg-bg-secondary'}`}
                            title="Disminuir prioridad"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <Icon className={`w-4 h-4 ${metodoInfo.color}`} />
                        <span className={`flex-1 text-xs font-medium ${metodo.activo ? 'text-text-primary' : 'text-text-secondary line-through'}`}>
                          {metodoInfo.label}
                        </span>

                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={metodo.activo}
                            onChange={() => handleCheckMethodToggle(metodo.id)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-bg-tertiary peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-bg-primary after:border-border-subtle after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent"></div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Footer */}
        {!inline && (
          <div className="bg-bg-primary p-3 border-t border-border-subtle flex-shrink-0">
            <div className="flex gap-3">
              <button
                onClick={onBack || onClose}
                className="flex-1 px-4 py-2 text-sm bg-bg-primary border border-border-subtle text-text-secondary rounded-xl font-semibold hover:bg-bg-secondary transition-colors"
              >
                {onBack ? "Volver" : "Cancelar"}
              </button>
              <button
                onClick={handleSave}
                disabled={savingCredenciales}
                className="flex-1 px-4 py-2 text-sm bg-accent text-white rounded-xl font-semibold hover:bg-accent-hover transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {savingCredenciales ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {savingCredenciales ? "Guardando..." : "Guardar Preferencias"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
