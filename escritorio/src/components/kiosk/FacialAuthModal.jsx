import { useState, useEffect, useRef } from "react";
import { X, CheckCircle, XCircle, Camera, LogIn } from "lucide-react";
import { useFaceDetection } from "../../hooks/useFaceDetection";
import { identificarPorFacial } from "../../services/biometricAuthService";
import { guardarSesion } from "../../services/biometricAuthService";
import { API_CONFIG } from "../../config/apiEndPoint";
import { useCamera } from "../../context/CameraContext";
import * as faceapi from 'face-api.js';

export default function FacialAuthModal({ onClose, onAuthSuccess }) {
  const [step, setStep] = useState("capturing"); // capturing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const [proximityMessage, setProximityMessage] = useState("");
  const [faceDetected, setFaceDetected] = useState(false);

  // Hook de camara singleton
  const { initCamera, releaseCamera } = useCamera();

  const {
    modelsLoaded,
    detectionProgress,
    detectionError,
    loadModels,
    stopFaceDetection,
  } = useFaceDetection();

  const cropCanvasRef = useRef(null);

  // Recortar video al area del ovalo guia
  const getCroppedOvalFrame = (video) => {
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    if (!vw || !vh) return null;

    const displayAspect = 4 / 3;
    const videoAspect = vw / vh;
    let sx, sy, sw, sh;
    if (videoAspect > displayAspect) {
      sh = vh; sw = vh * displayAspect;
      sx = (vw - sw) / 2; sy = 0;
    } else {
      sw = vw; sh = vw / displayAspect;
      sx = 0; sy = (vh - sh) / 2;
    }

    const oLeft = 120 / 400, oTop = 35 / 300;
    const oW = 160 / 400, oH = 210 / 300;
    const cropX = sx + sw * oLeft;
    const cropY = sy + sh * oTop;
    const cropW = sw * oW;
    const cropH = sh * oH;

    if (!cropCanvasRef.current) {
      cropCanvasRef.current = document.createElement('canvas');
    }
    const canvas = cropCanvasRef.current;
    const cw = 280, ch = Math.round(280 * (cropH / cropW));
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, cw, ch);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cw / 2, ch / 2, cw / 2, ch / 2, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, cw, ch);
    ctx.restore();

    return canvas;
  };

  // Cargar modelos e iniciar camara al montar
  useEffect(() => {
    let isRegistered = false;
    try {
      isRegistered = JSON.parse(localStorage.getItem("cached_camera_registered") || "false");
    } catch {
      isRegistered = false;
    }

    if (!isRegistered) {
      console.warn("🚫 [FacialAuthModal] Cámara no registrada. Abortando inicio de cámara.");
      setErrorMessage("La cámara no está registrada en el sistema. Contacte al administrador.");
      setStep("error");
      return;
    }

    loadModels();

    // Iniciar camara automaticamente
    initCamera()
      .then((mediaStream) => {
        const video = document.getElementById("authVideo");
        if (video) {
          video.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error("Error accediendo a la camara:", err);
        setErrorMessage("No se pudo acceder a la camara");
        setStep("error");
      });
  }, [loadModels, initCamera]);

  // Iniciar deteccion cuando el video este listo
  useEffect(() => {
    if (step !== "capturing" || !modelsLoaded) return;

    const video = document.getElementById("authVideo");
    if (!video) return;

    let capturado = false;
    let captureInterval = null;
    let timeoutId = null;

    const handleVideoReady = () => {
      console.log("📹 Video listo para autenticacion facial...");

      captureInterval = setInterval(async () => {
        if (capturado) return;

        try {
          const croppedFrame = getCroppedOvalFrame(video);
          if (!croppedFrame) return;

          const detections = await faceapi
            .detectSingleFace(croppedFrame, new faceapi.TinyFaceDetectorOptions({
              inputSize: 224,
              scoreThreshold: 0.4
            }))
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detections && detections.detection.score > 0.4) {

            setFaceDetected(true); // <-- This is what enables the proximity text

            // Validar posición de proximidad
            const box = detections.detection.box;
            const canvasW = 280;
            // cropH/cropW aspect is (3/4)*(0.7/0.4) = 1.3125
            const canvasH = 368;
            const faceCenterX = box.x + box.width / 2;
            const faceCenterY = box.y + box.height / 2;

            const widthRatio = box.width / canvasW;
            const heightRatio = box.height / canvasH;

            let isPositionGood = false;

            if (widthRatio < 0.35 || heightRatio < 0.35) {
              setProximityMessage("Acércate un poco más a la cámara");
            } else if (widthRatio > 0.85 || heightRatio > 0.85) {
              setProximityMessage("Aléjate un poco de la cámara");
            } else if (Math.abs(faceCenterX - canvasW / 2) > canvasW * 0.20 || Math.abs(faceCenterY - canvasH / 2) > canvasH * 0.20) {
              setProximityMessage("Centra tu rostro dentro del óvalo");
            } else {
              setProximityMessage("¡Posición perfecta! Autenticando...");
              isPositionGood = true;
            }

            if (isPositionGood && !capturado) {
              capturado = true;
              clearInterval(captureInterval);
              if (timeoutId) clearTimeout(timeoutId);

              const descriptor = Array.from(detections.descriptor);
              console.log("✅ Rostro capturado para autenticacion");

              // Convertir descriptor a Base64
              const float32Array = new Float32Array(descriptor);
              const buffer = new Uint8Array(float32Array.buffer);
              let binary = '';
              for (let i = 0; i < buffer.length; i++) {
                binary += String.fromCharCode(buffer[i]);
              }
              const descriptorBase64 = btoa(binary);

              console.log(`📦 Descriptor convertido a Base64: ${descriptorBase64.length} caracteres`);

              // Identificar usuario por facial
              try {
                const response = await identificarPorFacial(descriptorBase64);

                if (response.success) {
                  console.log("✅ Usuario identificado:", response.usuario);

                  // Extraer empleado_id para autenticar via /api/auth/biometric
                  const empleadoId = response.usuario.id_empleado || response.usuario.id;

                  if (!empleadoId) {
                    setErrorMessage("No se pudo obtener el ID del empleado");
                    setStep("error");
                    return;
                  }

                  // Autenticar via /api/auth/biometric (mismo flujo que BiometricAuth)
                  const authResponse = await fetch(`${API_CONFIG.BASE_URL}/api/auth/biometric`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ empleado_id: empleadoId }),
                  });

                  if (!authResponse.ok) {
                    const errorData = await authResponse.json().catch(() => ({}));
                    throw new Error(errorData.message || "Error al autenticar");
                  }

                  const authResult = await authResponse.json();

                  if (!authResult.success) {
                    throw new Error(authResult.message || "Error en autenticacion");
                  }

                  const { usuario, roles, permisos, esAdmin, token } = authResult.data;

                  if (token) {
                    localStorage.setItem("auth_token", token);
                  }

                  const usuarioCompleto = {
                    ...usuario,
                    roles,
                    permisos,
                    esAdmin,
                    token,
                    matchScore: response.matchScore,
                    metodoAutenticacion: "FACIAL",
                  };

                  guardarSesion(usuarioCompleto);

                  setSuccessMessage(`Bienvenido, ${usuarioCompleto.nombre || usuarioCompleto.id}`);
                  setStep("success");

                  // Callback y cerrar despues de mostrar mensaje
                  setTimeout(() => {
                    if (onAuthSuccess) {
                      onAuthSuccess(usuarioCompleto);
                    }
                    handleClose();
                  }, 2000);
                } else {
                  setErrorMessage(response.error || "Rostro no reconocido en el sistema");
                  setStep("error");
                }
              } catch (error) {
                console.error("Error identificando usuario:", error);
                setErrorMessage(error.message || "Error al identificar rostro");
                setStep("error");
              }
            }
          } else {
            setFaceDetected(false);
            setProximityMessage("");
          }
        } catch (error) {
          console.error("❌ Error en deteccion:", error);
        }
      }, 500);

      // Timeout de 15 segundos
      timeoutId = setTimeout(() => {
        if (!capturado) {
          clearInterval(captureInterval);
          setErrorMessage("Tiempo agotado. No se detecto un rostro valido.");
          setStep("error");
        }
      }, 15000);
    };

    const handleCanPlay = () => {
      if (video.readyState >= 2) {
        handleVideoReady();
      }
    };

    video.addEventListener("loadeddata", handleCanPlay);
    video.addEventListener("canplay", handleCanPlay);

    if (video.readyState >= 2) {
      handleVideoReady();
    }

    return () => {
      video.removeEventListener("loadeddata", handleCanPlay);
      video.removeEventListener("canplay", handleCanPlay);
      if (captureInterval) clearInterval(captureInterval);
      if (timeoutId) clearTimeout(timeoutId);
      stopFaceDetection();
    };
  }, [step, modelsLoaded, onAuthSuccess, stopFaceDetection]);

  // Limpiar camara al cerrar
  useEffect(() => {
    return () => {
      releaseCamera();
    };
  }, [releaseCamera]);

  const handleClose = () => {
    setIsClosing(true);
    releaseCamera();
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleRetry = () => {
    setStep("capturing");
    setErrorMessage("");

    // Reiniciar camara
    initCamera()
      .then((mediaStream) => {
        const video = document.getElementById("authVideo");
        if (video) {
          video.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        setErrorMessage("No se pudo acceder a la camara");
        setStep("error");
      });
  };

  return (
    <div className={`fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-[9999] p-4 transition-all duration-300 animate-backdrop ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={`bg-bg-primary rounded-xl shadow-2xl max-w-md sm:max-w-lg 2xl:max-w-xl w-full overflow-hidden border border-border-subtle transition-all duration-300 animate-zoom-in ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          {/* Header Minimalista (Estilo AsistenciaFacial) */}
          <div className="text-center mb-6 relative">
            <button
              onClick={handleClose}
              className="absolute -top-2 -right-2 text-text-tertiary hover:text-text-primary hover:bg-bg-secondary rounded-md p-2 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Reconocimiento Facial</h2>
            <p className="text-text-tertiary text-xs mt-1 opacity-80 uppercase tracking-widest font-medium">Autenticación Biométrica</p>
          </div>

          {/* Contenido */}
          {/* Capturando */}
          {step === "capturing" && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-xl overflow-hidden w-full aspect-[4/3] min-h-[280px] 2xl:min-h-[450px]">
                <video
                  id="authVideo"
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover min-h-[280px] 2xl:min-h-[450px]"
                  style={{ transform: "scaleX(-1)" }}
                />

                {/* Guias de captura - Ovalo facial con animaciones */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                    <defs>
                      <mask id="authFaceMask">
                        <rect width="400" height="300" fill="white" />
                        <ellipse cx="200" cy="140" rx="80" ry="105" fill="black" />
                      </mask>
                      <filter id="authGlow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <linearGradient id="authScanGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="transparent" />
                        <stop offset="30%" stopColor={faceDetected ? "rgba(25, 118, 210, 0.6)" : "rgba(255,255,255,0.3)"} />
                        <stop offset="50%" stopColor={faceDetected ? "rgba(25, 118, 210, 0.9)" : "rgba(255,255,255,0.5)"} />
                        <stop offset="70%" stopColor={faceDetected ? "rgba(25, 118, 210, 0.6)" : "rgba(255,255,255,0.3)"} />
                        <stop offset="100%" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                    <rect width="400" height="300" fill="rgba(0,0,0,0.45)" mask="url(#authFaceMask)" />
                    <ellipse
                      cx="200" cy="140" rx="80" ry="105"
                      fill="none"
                      stroke={faceDetected ? "rgb(var(--accent))" : "rgba(255,255,255,0.6)"}
                      strokeWidth={faceDetected ? "3" : "2"}
                      strokeDasharray={faceDetected ? "none" : "8 4"}
                      filter={faceDetected ? "url(#authGlow)" : "none"}
                      style={{ transition: "all 0.4s ease" }}
                    />
                    {faceDetected && (
                      <ellipse
                        cx="200" cy="140" rx="84" ry="109"
                        fill="none"
                        stroke="rgba(25, 118, 210, 0.25)"
                        strokeWidth="6"
                        style={{ animation: "authFacePulse 2s ease-in-out infinite" }}
                      />
                    )}
                    {!faceDetected && (
                      <line
                        x1="120" y1="140" x2="280" y2="140"
                        stroke="url(#authScanGradient)"
                        strokeWidth="2"
                        style={{ animation: "authScanLine 2.5s ease-in-out infinite" }}
                      />
                    )}
                    <path d="M 135 55 L 135 40 L 155 40" fill="none" stroke={faceDetected ? "rgb(var(--accent))" : "rgba(255,255,255,0.7)"} strokeWidth="3" strokeLinecap="round" style={{ transition: "stroke 0.3s ease" }} />
                    <path d="M 265 55 L 265 40 L 245 40" fill="none" stroke={faceDetected ? "rgb(var(--accent))" : "rgba(255,255,255,0.7)"} strokeWidth="3" strokeLinecap="round" style={{ transition: "stroke 0.3s ease" }} />
                    <path d="M 135 245 L 135 260 L 155 260" fill="none" stroke={faceDetected ? "rgb(var(--accent))" : "rgba(255,255,255,0.7)"} strokeWidth="3" strokeLinecap="round" style={{ transition: "stroke 0.3s ease" }} />
                    <path d="M 265 245 L 265 260 L 245 260" fill="none" stroke={faceDetected ? "rgb(var(--accent))" : "rgba(255,255,255,0.7)"} strokeWidth="3" strokeLinecap="round" style={{ transition: "stroke 0.3s ease" }} />
                    <line x1="196" y1="135" x2="204" y2="135" stroke={faceDetected ? "rgba(25,118,210,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
                    <line x1="200" y1="131" x2="200" y2="139" stroke={faceDetected ? "rgba(25,118,210,0.4)" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
                  </svg>
                  <style>{`
                    @keyframes authScanLine {
                      0% { transform: translateY(-60px); opacity: 0; }
                      15% { opacity: 1; }
                      85% { opacity: 1; }
                      100% { transform: translateY(60px); opacity: 0; }
                    }
                    @keyframes authFacePulse {
                      0%, 100% { opacity: 0.3; }
                      50% { opacity: 0.8; }
                    }
                  `}</style>
                </div>
              </div>

              {/* Indicadores */}
              <div className="space-y-2">
                <p className={`text-center text-sm font-medium ${proximityMessage === "¡Posición perfecta! Autenticando..." ? "text-green-600 dark:text-green-400" : proximityMessage ? "text-accent dark:text-accent-hover" : "text-gray-700 dark:text-gray-300"}`}>
                  {!modelsLoaded && "Cargando modelos de reconocimiento..."}
                  {modelsLoaded && (proximityMessage || "Coloca tu rostro frente a la cámara")}
                </p>

                {modelsLoaded && (
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className={`flex items-center gap-1.5 ${faceDetected ? 'text-accent dark:text-accent-hover' : 'text-gray-500 dark:text-gray-400'}`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${faceDetected ? 'bg-accent animate-pulse' : 'bg-gray-400'}`} />
                      <span className="font-medium">Rostro detectado</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                      <LogIn className="w-4 h-4" />
                      <span className="font-medium">Identificando...</span>
                    </div>
                  </div>
                )}

                {modelsLoaded && detectionProgress > 0 && (
                  <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-accent h-full transition-all duration-300 rounded-full"
                      style={{ width: `${detectionProgress}%` }}
                    />
                  </div>
                )}

                {!modelsLoaded && (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent"></div>
                    <span className="text-gray-600 dark:text-gray-400 text-xs">Cargando modelos...</span>
                  </div>
                )}

                {detectionError && (
                  <p className="text-center text-red-500 dark:text-red-400 text-xs font-medium">{detectionError}</p>
                )}
              </div>
            </div>
          )}

          {/* Exito */}
          {step === "success" && (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-success/10 rounded-full flex items-center justify-center ring-4 ring-success/5">
                <CheckCircle className="w-12 h-12 text-success" strokeWidth={2.5} />
              </div>
              <h4 className="text-2xl font-bold text-text-primary mb-6">
                Autenticación Exitosa
              </h4>
              <p className="text-success font-bold">{successMessage}</p>
            </div>
          )}

          {/* Error */}
          {step === "error" && (
            <div className="text-center py-8 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 mx-auto mb-6 bg-error/10 rounded-full flex items-center justify-center ring-4 ring-error/5">
                <XCircle className="w-12 h-12 text-error" strokeWidth={2.5} />
              </div>
              <h4 className="text-2xl font-bold text-text-primary mb-2">Error de Autenticación</h4>
              <p className="text-text-secondary text-sm mb-8 max-w-[280px] mx-auto">{errorMessage}</p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRetry}
                  className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl transition-all shadow-md active:scale-95"
                >
                  Intentar de Nuevo
                </button>
                <button
                  onClick={handleClose}
                  className="w-full text-text-tertiary font-bold text-sm hover:text-text-primary transition-colors h-10"
                >
                  Cancelar y Salir
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
