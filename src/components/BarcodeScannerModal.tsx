import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Camera,
  Scan,
  RefreshCw,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Layers,
  Plus,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { usePos } from '../context/PosContext';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Sound effect generators using Web Audio API
function playScanSound(success: boolean) {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    if (success) {
      // High pleasant double-beep
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, audioCtx.currentTime); // C6
      osc.frequency.setValueAtTime(1318.5, audioCtx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.18);
    } else {
      // Low buzz error sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    }
  } catch {
    // AudioContext not supported or permission denied
  }
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, addToCart, cart } = usePos();

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [continuousMode, setContinuousMode] = useState<boolean>(true);
  const [recentScans, setRecentScans] = useState<Array<{ product: Product; time: string; count: number }>>([]);
  const [lastScannedMessage, setLastScannedMessage] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
    product?: Product;
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Keep latest mutable props in ref so callbacks don't recreate and trigger camera restarts
  const stateRef = useRef({
    products,
    cart,
    addToCart,
    soundEnabled,
    continuousMode,
    onClose,
  });

  useEffect(() => {
    stateRef.current = {
      products,
      cart,
      addToCart,
      soundEnabled,
      continuousMode,
      onClose,
    };
  });

  // Handle scanned barcode text
  const handleBarcodeDecoded = useCallback((decodedText: string) => {
    const code = decodedText.trim();
    if (!code) return;

    // Prevent duplicate instant fire within cooldown
    if (scanLockRef.current) return;
    scanLockRef.current = true;

    const {
      products: currentProducts,
      cart: currentCart,
      addToCart: currentAddToCart,
      soundEnabled: isSoundOn,
      continuousMode: isContinuous,
      onClose: closeFn,
    } = stateRef.current;

    // Find matching product by exact SKU or ID (case-insensitive)
    const matched = currentProducts.find(
      (p) =>
        p.sku.toLowerCase() === code.toLowerCase() ||
        String(p.id).toLowerCase() === code.toLowerCase() ||
        p.name.toLowerCase() === code.toLowerCase()
    );

    if (matched) {
      if (matched.stock <= 0) {
        if (isSoundOn) playScanSound(false);
        if (isMountedRef.current) {
          setLastScannedMessage({
            type: 'warning',
            text: `Stok ${matched.name} (${matched.sku}) Habis!`,
            product: matched,
          });
        }
      } else {
        // Check if cart has reached stock limit
        const inCart = currentCart.find((ci) => ci.product.id === matched.id);
        if (inCart && inCart.quantity >= matched.stock) {
          if (isSoundOn) playScanSound(false);
          if (isMountedRef.current) {
            setLastScannedMessage({
              type: 'warning',
              text: `Maksimal stok tercapai (${matched.stock} unit).`,
              product: matched,
            });
          }
        } else {
          // Success
          currentAddToCart(matched);
          if (isSoundOn) playScanSound(true);
          if (isMountedRef.current) {
            setLastScannedMessage({
              type: 'success',
              text: `Berhasil menambahkan: ${matched.name}`,
              product: matched,
            });

            // Update recent scans list
            setRecentScans((prev) => {
              const existingIndex = prev.findIndex((item) => item.product.id === matched.id);
              const nowTime = new Date().toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });
              if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = {
                  ...updated[existingIndex],
                  count: updated[existingIndex].count + 1,
                  time: nowTime,
                };
                return updated;
              } else {
                return [{ product: matched, time: nowTime, count: 1 }, ...prev.slice(0, 4)];
              }
            });
          }

          if (!isContinuous) {
            // Close after single scan
            setTimeout(() => {
              closeFn();
            }, 800);
          }
        }
      }
    } else {
      if (isSoundOn) playScanSound(false);
      if (isMountedRef.current) {
        setLastScannedMessage({
          type: 'error',
          text: `Kode "${code}" tidak ditemukan dalam katalog produk!`,
        });
      }
    }

    // Unlock after 1.5 seconds cooldown to prevent rapid multi-triggers on continuous camera frame
    setTimeout(() => {
      scanLockRef.current = false;
    }, 1500);
  }, []);

  // Initialize and start camera
  const startCamera = useCallback(
    async (cameraId?: string) => {
      if (!isMountedRef.current) return;
      setCameraError(null);
      const readerElement = document.getElementById('barcode-reader');
      if (!readerElement) return;

      try {
        if (html5QrCodeRef.current) {
          try {
            if (html5QrCodeRef.current.isScanning) {
              await html5QrCodeRef.current.stop();
            }
            html5QrCodeRef.current.clear();
          } catch {
            // ignored
          }
          html5QrCodeRef.current = null;
        }

        const formatsToSupport = [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
        ];

        const html5QrCode = new Html5Qrcode('barcode-reader', {
          formatsToSupport,
          verbose: false,
        });
        html5QrCodeRef.current = html5QrCode;

        // Get cameras if not loaded
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          if (isMountedRef.current) {
            setAvailableCameras(
              devices.map((d) => ({ id: d.id, label: d.label || `Kamera ${d.id.slice(0, 4)}` }))
            );
          }
          const targetCameraId = cameraId || selectedCameraId || devices[devices.length - 1].id;
          if (isMountedRef.current) {
            setSelectedCameraId(targetCameraId);
          }

          const config = {
            fps: 15,
            qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
              const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
              return {
                width: Math.floor(minEdge * 0.8),
                height: Math.floor(minEdge * 0.55),
              };
            },
            aspectRatio: 1.333333,
          };

          await html5QrCode.start(
            targetCameraId,
            config,
            (decodedText) => {
              handleBarcodeDecoded(decodedText);
            },
            () => {
              // Frame decode tick
            }
          );
          if (isMountedRef.current) {
            setIsScanning(true);
          }
        } else {
          if (isMountedRef.current) {
            setCameraError('Tidak ada perangkat kamera yang terdeteksi pada perangkat ini.');
          }
        }
      } catch (err: unknown) {
        console.error('Camera start error:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        if (isMountedRef.current) {
          if (errMsg.includes('Permission') || errMsg.includes('NotAllowedError')) {
            setCameraError('Izin akses kamera ditolak. Berikan izin kamera pada browser untuk menggunakan pemindai.');
          } else {
            setCameraError(`Gagal memulai kamera: ${errMsg}`);
          }
          setIsScanning(false);
        }
      }
    },
    [selectedCameraId, handleBarcodeDecoded]
  );

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
      html5QrCodeRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  }, []);

  // Handle Torch / Flash toggle
  const toggleTorch = async () => {
    if (!html5QrCodeRef.current || !isScanning) return;
    try {
      await html5QrCodeRef.current.applyVideoConstraints({
        advanced: [{ torch: !torchOn } as unknown as MediaTrackConstraintSet],
      });
      setTorchOn(!torchOn);
    } catch {
      alert('Fitur lampu kilat (flash) tidak didukung pada kamera ini.');
    }
  };

  // Handle image file scan
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const html5QrCode = new Html5Qrcode('barcode-file-reader-dummy', {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
        ],
        verbose: false,
      });

      const decodedText = await html5QrCode.scanFile(file, true);
      handleBarcodeDecoded(decodedText);
      html5QrCode.clear();
    } catch {
      if (stateRef.current.soundEnabled) playScanSound(false);
      if (isMountedRef.current) {
        setLastScannedMessage({
          type: 'error',
          text: 'Tidak dapat mendeteksi barcode pada gambar yang diunggah.',
        });
      }
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Manage open / close lifecycle
  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
      setLastScannedMessage(null);
    }
    return () => {
      isMountedRef.current = false;
      stopCamera();
    };
  }, [isOpen, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div
      id="barcode-scanner-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
    >
      {/* Hidden container for file scanning */}
      <div id="barcode-file-reader-dummy" className="hidden" />

      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-[#e2e1f2]">
        {/* Header */}
        <div className="px-5 py-4 bg-[#684cb6] text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Pemindai Barcode / SKU</h3>
              <p className="text-xs text-white/80">
                Arahkan kamera ke barcode produk untuk otomatis masuk ke keranjang
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Camera Viewport Frame */}
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-4/3 sm:aspect-16/10 flex items-center justify-center shadow-inner border border-black/20">
            {/* The Target HTML5 QR code video rendering div */}
            <div id="barcode-reader" className="w-full h-full object-cover" />

            {/* Overlaid Animated Viewfinder Frame */}
            {isScanning && !cameraError && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                <div className="relative w-3/4 max-w-[280px] h-36 border-2 border-dashed border-[#684cb6]/80 rounded-xl bg-[#684cb6]/5 flex flex-col justify-between p-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                  {/* Corner Reticles */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-3 border-l-3 border-[#684cb6] rounded-tl-sm" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-3 border-r-3 border-[#684cb6] rounded-tr-sm" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-3 border-l-3 border-[#684cb6] rounded-bl-sm" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-3 border-r-3 border-[#684cb6] rounded-br-sm" />

                  {/* Red Laser Scanner Sweep Animation */}
                  <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-bounce" />

                  <div className="text-center">
                    <span className="text-[10px] font-semibold text-white/90 bg-black/60 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      Posisikan Barcode di Kotak Ini
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Camera Error / Permission Fallback */}
            {cameraError && (
              <div className="absolute inset-0 bg-neutral-900/90 text-white p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <p className="text-xs sm:text-sm font-semibold max-w-sm text-neutral-200">
                  {cameraError}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => startCamera()}
                    className="px-3.5 py-1.5 bg-[#684cb6] hover:bg-[#583ca4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                  <label className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Foto Barcode</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileScan}
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Quick Camera Bar Controls */}
            {isScanning && !cameraError && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-20">
                <button
                  type="button"
                  onClick={toggleTorch}
                  title="Flashlight"
                  className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    torchOn ? 'bg-amber-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
                  }`}
                >
                  {torchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  title="Sound Beep"
                  className={`p-2 rounded-xl backdrop-blur-md transition-all cursor-pointer ${
                    soundEnabled ? 'bg-black/40 text-white hover:bg-black/60' : 'bg-red-500 text-white'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Real-time Feedback Banner */}
          {lastScannedMessage && (
            <div
              className={`p-3 rounded-xl flex items-center gap-3 transition-all animate-in slide-in-from-top-1 ${
                lastScannedMessage.type === 'success'
                  ? 'bg-emerald-50 text-[#006d4b] border border-emerald-200'
                  : lastScannedMessage.type === 'warning'
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {lastScannedMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#006d4b]" />
              ) : (
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
              )}
              <div className="flex-1 text-xs">
                <p className="font-bold">{lastScannedMessage.text}</p>
                {lastScannedMessage.product && (
                  <p className="opacity-80 text-[11px] mt-0.5">
                    {lastScannedMessage.product.sku} • {formatRupiah(lastScannedMessage.product.price)}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Quick Settings Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#fbf8ff] rounded-xl border border-[#e2e1f2] text-xs">
            {/* Camera Switcher Dropdown */}
            {availableCameras.length > 1 && (
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#684cb6]" />
                <select
                  value={selectedCameraId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setSelectedCameraId(newId);
                    startCamera(newId);
                  }}
                  className="bg-white border border-[#e2e1f2] rounded-lg px-2 py-1 text-xs text-[#30323e] focus:outline-none focus:border-[#684cb6]"
                >
                  {availableCameras.map((cam, idx) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label || `Kamera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Continuous Scan Mode Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <label className="flex items-center gap-1.5 cursor-pointer text-[#5d5e6c]">
                <input
                  type="checkbox"
                  checked={continuousMode}
                  onChange={(e) => setContinuousMode(e.target.checked)}
                  className="accent-[#684cb6] rounded"
                />
                <span className="font-semibold text-[11px]">Mode Scan Beruntun (Multi-Scan)</span>
              </label>

              {/* Upload image button */}
              <label className="px-2.5 py-1 bg-white border border-[#e2e1f2] rounded-lg text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold">
                <Upload className="w-3 h-3" />
                <span>Upload Foto</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileScan}
                />
              </label>
            </div>
          </div>

          {/* Quick Barcode Simulator / Catalog Presets (Convenient for testing in web browsers without barcode hardware) */}
          <div className="border-t border-[#e2e1f2] pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#30323e] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#684cb6]" />
                <span>Simulasi / Pilih Cepat Barcode SKU</span>
              </span>
              <span className="text-[10px] text-[#797988]">Klik untuk uji scan</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {products.slice(0, 6).map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleBarcodeDecoded(prod.sku)}
                  className="text-left p-2 rounded-xl bg-white border border-[#e2e1f2] hover:border-[#684cb6] hover:bg-[#fbf8ff] transition-all flex items-center gap-2 group cursor-pointer"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-8 h-8 rounded-lg object-cover bg-[#f4f2fe] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-[#30323e] truncate group-hover:text-[#684cb6]">
                      {prod.name}
                    </p>
                    <p className="text-[10px] font-mono text-[#684cb6] font-semibold">
                      {prod.sku}
                    </p>
                  </div>
                  <Plus className="w-3.5 h-3.5 text-[#797988] group-hover:text-[#684cb6] shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Recently Scanned in this session */}
          {recentScans.length > 0 && (
            <div className="border-t border-[#e2e1f2] pt-3">
              <span className="text-xs font-bold text-[#30323e] block mb-1.5">
                Item Baru Saja Di-scan ({recentScans.reduce((a, b) => a + b.count, 0)} item)
              </span>
              <div className="space-y-1.5">
                {recentScans.map(({ product, time, count }) => (
                  <div
                    key={product.id}
                    className="flex justify-between items-center text-xs bg-[#f4f2fe]/60 border border-[#e2e1f2] px-3 py-1.5 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#30323e]">{product.name}</span>
                      <span className="text-[10px] text-[#797988] font-mono">({product.sku})</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold text-[#684cb6]">
                      <span>{count}x</span>
                      <span className="text-[10px] text-[#797988] font-normal">{time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-[#fbf8ff] border-t border-[#e2e1f2] flex justify-between items-center shrink-0">
          <div className="text-xs text-[#5d5e6c]">
            Status: <span className="font-semibold text-[#006d4b]">Kamera Aktif</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#684cb6] hover:bg-[#583ca4] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Selesai Memindai
          </button>
        </div>
      </div>
    </div>
  );
};
