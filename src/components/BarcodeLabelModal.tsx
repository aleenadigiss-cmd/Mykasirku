import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Tag,
  Barcode as BarcodeIcon,
  Sliders,
  Sparkles,
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import { Product } from '../types';
import { formatRupiah } from '../utils/formatters';
import { usePos } from '../context/PosContext';

interface BarcodeLabelModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  allProducts?: Product[];
}

export const BarcodeLabelModal: React.FC<BarcodeLabelModalProps> = ({
  isOpen,
  onClose,
  product,
  allProducts = [],
}) => {
  const { settings, showToast } = usePos();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(product || allProducts[0] || null);
  const [labelSize, setLabelSize] = useState<'standard' | 'mini' | 'shelf'>('standard');
  const [copies, setCopies] = useState<number>(4);
  const [showPrice, setShowPrice] = useState<boolean>(true);
  const [showStoreName, setShowStoreName] = useState<boolean>(true);
  const [showSkuText, setShowSkuText] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [printMode, setPrintMode] = useState<'single' | 'batch'>('single');

  const printContainerRef = useRef<HTMLDivElement>(null);
  const previewSvgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (product) {
      setSelectedProduct(product);
      setPrintMode('single');
    } else if (allProducts.length > 0) {
      setSelectedProduct(allProducts[0]);
    }
  }, [product, allProducts]);

  // Render preview barcode whenever selectedProduct or options change
  useEffect(() => {
    if (!isOpen || !selectedProduct || !previewSvgRef.current) return;

    try {
      const code = selectedProduct.sku || String(selectedProduct.id);
      JsBarcode(previewSvgRef.current, code, {
        format: 'CODE128',
        lineColor: '#1e1b4b',
        width: labelSize === 'mini' ? 1.5 : 2,
        height: labelSize === 'mini' ? 35 : labelSize === 'shelf' ? 55 : 45,
        displayValue: showSkuText,
        fontSize: labelSize === 'mini' ? 11 : 13,
        textMargin: 3,
        font: 'monospace',
        margin: 5,
        background: 'transparent',
      });
    } catch (err) {
      console.error('JsBarcode render error in preview:', err);
    }
  }, [isOpen, selectedProduct, labelSize, showSkuText]);

  // Effect to render barcodes in printable area
  useEffect(() => {
    if (!isOpen || !printContainerRef.current) return;

    const svgs = printContainerRef.current.querySelectorAll<SVGSVGElement>('svg.barcode-item-svg');
    svgs.forEach((svg) => {
      const code = svg.getAttribute('data-code');
      if (code) {
        try {
          JsBarcode(svg, code, {
            format: 'CODE128',
            lineColor: '#000000',
            width: labelSize === 'mini' ? 1.4 : labelSize === 'shelf' ? 2.2 : 1.8,
            height: labelSize === 'mini' ? 32 : labelSize === 'shelf' ? 52 : 42,
            displayValue: showSkuText,
            fontSize: labelSize === 'mini' ? 10 : 12,
            textMargin: 2,
            font: 'monospace',
            margin: 4,
            background: '#ffffff',
          });
        } catch (err) {
          console.error('JsBarcode batch print render error:', err);
        }
      }
    });
  }, [isOpen, selectedProduct, labelSize, copies, showSkuText, printMode, allProducts]);

  if (!isOpen) return null;

  const currentProd = selectedProduct;
  const storeTitle = settings.storeName || 'KASIRKU STORE';

  const handleCopySku = () => {
    if (!currentProd) return;
    navigator.clipboard.writeText(currentProd.sku);
    setCopied(true);
    showToast(`SKU Barcode "${currentProd.sku}" berhasil disalin!`, 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    if (!previewSvgRef.current || !currentProd) return;
    const svgData = new XMLSerializer().serializeToString(previewSvgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `Barcode_${currentProd.sku || currentProd.name}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
    showToast('File Barcode SVG berhasil didownload!', 'success');
  };

  const handleDownloadPng = () => {
    if (!previewSvgRef.current || !currentProd) return;
    const svgData = new XMLSerializer().serializeToString(previewSvgRef.current);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `Barcode_${currentProd.sku || currentProd.name}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        showToast('File Barcode PNG resolusi tinggi berhasil didownload!', 'success');
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handlePrint = () => {
    window.print();
  };

  // Determine items to print
  const itemsToPrint: Array<{ product: Product; index: number }> = [];
  if (printMode === 'single' && currentProd) {
    for (let i = 0; i < copies; i++) {
      itemsToPrint.push({ product: currentProd, index: i });
    }
  } else if (printMode === 'batch') {
    allProducts.forEach((p) => {
      for (let i = 0; i < copies; i++) {
        itemsToPrint.push({ product: p, index: i });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto">
      {/* Invisible Printable Container (Only visible during window.print()) */}
      <div id="barcode-printable-area" className="hidden print:block fixed inset-0 bg-white p-4 z-[99999]">
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              #barcode-printable-area, #barcode-printable-area * {
                visibility: visible;
              }
              #barcode-printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                background: white;
                padding: 10mm;
                display: block !important;
              }
              @page {
                size: auto;
                margin: 5mm;
              }
            }
          `}
        </style>

        <div
          className={`grid gap-4 ${
            labelSize === 'mini'
              ? 'grid-cols-4'
              : labelSize === 'shelf'
              ? 'grid-cols-2'
              : 'grid-cols-3'
          }`}
        >
          {itemsToPrint.map(({ product: p, index }) => (
            <div
              key={`${p.id}-${index}`}
              className="border border-black/30 rounded p-2 flex flex-col items-center justify-between text-center bg-white break-inside-avoid"
              style={{
                width: labelSize === 'mini' ? '40mm' : labelSize === 'shelf' ? '75mm' : '55mm',
                height: labelSize === 'mini' ? '28mm' : labelSize === 'shelf' ? '45mm' : '35mm',
              }}
            >
              {showStoreName && (
                <p className="text-[9px] font-bold uppercase tracking-wider text-black truncate max-w-full">
                  {storeTitle}
                </p>
              )}
              <p className="text-[11px] font-extrabold text-black leading-tight line-clamp-1 max-w-full">
                {p.name}
              </p>
              <div className="w-full flex justify-center my-0.5">
                <svg
                  className="barcode-item-svg max-w-full"
                  data-code={p.sku || String(p.id)}
                />
              </div>
              {showPrice && (
                <p className="text-xs font-black text-black">
                  {formatRupiah(p.price)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Modal Dialog Box */}
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#e2e1f2] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#e2e1f2] flex items-center justify-between bg-[#fbf8ff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#684cb6] text-white flex items-center justify-center shadow-xs">
              <BarcodeIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-[#30323e]">
                Generator & Cetak Label Barcode
              </h3>
              <p className="text-xs text-[#5d5e6c]">
                Cetak stiker barcode standar Code 128 untuk scanner kasir & label harga rak
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[#797988] hover:text-[#30323e] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Target Product Selector if multiple products available */}
          {allProducts.length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between p-3.5 bg-[#f4f2fe]/60 rounded-2xl border border-[#e2e1f2]">
              <div className="flex-1 w-full">
                <label className="block text-[11px] font-bold text-[#5d5e6c] uppercase tracking-wider mb-1">
                  Pilih Produk Target
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const found = allProducts.find((p) => String(p.id) === e.target.value);
                    if (found) setSelectedProduct(found);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-[#e2e1f2] bg-white text-xs font-semibold text-[#30323e] focus:border-[#684cb6] outline-none"
                >
                  {allProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — SKU: {p.sku} ({formatRupiah(p.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Mode switch: Single vs Batch */}
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#e2e1f2] shrink-0">
                <button
                  type="button"
                  onClick={() => setPrintMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printMode === 'single'
                      ? 'bg-[#684cb6] text-white shadow-xs'
                      : 'text-[#5d5e6c] hover:bg-[#f4f2fe]'
                  }`}
                >
                  Satu Produk
                </button>
                <button
                  type="button"
                  onClick={() => setPrintMode('batch')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    printMode === 'batch'
                      ? 'bg-[#684cb6] text-white shadow-xs'
                      : 'text-[#5d5e6c] hover:bg-[#f4f2fe]'
                  }`}
                  title="Cetak label untuk semua produk di katalog sekaligus"
                >
                  Semua Produk ({allProducts.length})
                </button>
              </div>
            </div>
          )}

          {/* Barcode Preview Card */}
          {currentProd ? (
            <div className="border border-[#e2e1f2] rounded-2xl p-5 bg-[#fbf8ff] flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopySku}
                  className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Salin SKU"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#006d4b]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Copy SKU'}</span>
                </button>
              </div>

              {/* Label sticker preview container */}
              <div
                className={`bg-white rounded-xl border-2 border-dashed border-[#684cb6]/40 shadow-xs p-4 flex flex-col items-center transition-all ${
                  labelSize === 'mini'
                    ? 'w-56'
                    : labelSize === 'shelf'
                    ? 'w-80'
                    : 'w-72'
                }`}
              >
                {showStoreName && (
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#797988] mb-0.5">
                    {storeTitle}
                  </p>
                )}
                <h4 className="text-sm font-extrabold text-[#30323e] leading-snug max-w-full px-2">
                  {currentProd.name}
                </h4>
                <p className="text-[11px] text-[#5d5e6c] mt-0.5">
                  Kategori: {currentProd.category}
                </p>

                {/* SVG 1D Barcode */}
                <div className="my-2 bg-white flex justify-center max-w-full overflow-hidden">
                  <svg ref={previewSvgRef} className="max-w-full" />
                </div>

                {showPrice && (
                  <div className="mt-1 pt-1.5 border-t border-[#e2e1f2] w-full flex items-center justify-between px-2">
                    <span className="text-[10px] uppercase font-bold text-[#797988]">Harga:</span>
                    <span className="text-sm font-extrabold text-[#684cb6]">
                      {formatRupiah(currentProd.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Barcode Quick Download Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Barcode PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:text-[#684cb6] hover:bg-[#f4f2fe] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download SVG Vektor</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#fbf8ff] rounded-2xl border border-[#e2e1f2] text-xs text-[#5d5e6c]">
              Belum ada produk yang dipilih untuk dicetak.
            </div>
          )}

          {/* Label Printing Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label Size Selection */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#e2e1f2] space-y-2">
              <label className="text-xs font-bold text-[#30323e] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#684cb6]" />
                <span>Ukuran & Tipe Label</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setLabelSize('mini')}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    labelSize === 'mini'
                      ? 'border-[#684cb6] bg-[#f4f2fe] text-[#684cb6] font-bold'
                      : 'border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#fbf8ff]'
                  }`}
                >
                  <p className="font-bold">Mini</p>
                  <p className="text-[10px] text-[#797988]">38 × 25 mm</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('standard')}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    labelSize === 'standard'
                      ? 'border-[#684cb6] bg-[#f4f2fe] text-[#684cb6] font-bold'
                      : 'border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#fbf8ff]'
                  }`}
                >
                  <p className="font-bold">Standar</p>
                  <p className="text-[10px] text-[#797988]">50 × 30 mm</p>
                </button>
                <button
                  type="button"
                  onClick={() => setLabelSize('shelf')}
                  className={`p-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                    labelSize === 'shelf'
                      ? 'border-[#684cb6] bg-[#f4f2fe] text-[#684cb6] font-bold'
                      : 'border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#fbf8ff]'
                  }`}
                >
                  <p className="font-bold">Label Rak</p>
                  <p className="text-[10px] text-[#797988]">70 × 40 mm</p>
                </button>
              </div>
            </div>

            {/* Copies & Quantity */}
            <div className="p-3.5 bg-white rounded-2xl border border-[#e2e1f2] space-y-2">
              <label className="text-xs font-bold text-[#30323e] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#684cb6]" />
                  <span>Jumlah Salinan (Lembar Stiker)</span>
                </span>
                <span className="text-[#684cb6] font-extrabold">{copies} stiker</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 4, 8, 12, 24].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCopies(num)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      copies === num
                        ? 'bg-[#684cb6] border-[#684cb6] text-white shadow-xs'
                        : 'bg-white border-[#e2e1f2] text-[#5d5e6c] hover:bg-[#f4f2fe]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggle Display Elements */}
          <div className="flex flex-wrap items-center gap-4 p-3 bg-[#fbf8ff] rounded-2xl border border-[#e2e1f2] text-xs">
            <span className="font-bold text-[#30323e]">Elemen Label:</span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#5d5e6c]">
              <input
                type="checkbox"
                checked={showStoreName}
                onChange={(e) => setShowStoreName(e.target.checked)}
                className="accent-[#684cb6] rounded"
              />
              <span>Nama Toko</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#5d5e6c]">
              <input
                type="checkbox"
                checked={showPrice}
                onChange={(e) => setShowPrice(e.target.checked)}
                className="accent-[#684cb6] rounded"
              />
              <span>Harga Jual (Rp)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-[#5d5e6c]">
              <input
                type="checkbox"
                checked={showSkuText}
                onChange={(e) => setShowSkuText(e.target.checked)}
                className="accent-[#684cb6] rounded"
              />
              <span>Teks SKU di bawah Barcode</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#e2e1f2] bg-[#fbf8ff] flex items-center justify-between gap-3">
          <p className="text-xs text-[#5d5e6c] hidden sm:block">
            Mendukung printer thermal stiker & printer inkjet/laser kertas stiker A4.
          </p>
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-[#e2e1f2] text-xs font-semibold text-[#5d5e6c] hover:bg-[#f4f2fe] transition-colors cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="button"
              id="btn-print-barcode-labels"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#684cb6] hover:bg-[#583ca4] active:scale-[0.98] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak {itemsToPrint.length} Label Stiker</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
