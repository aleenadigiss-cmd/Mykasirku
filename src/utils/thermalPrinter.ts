import { Transaction, StoreSettings, PrinterDeviceInfo } from '../types';
import { formatRupiah } from './formatters';

// Web Audio API beep simulation for mini printers
export const playPrinterBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // Ignore audio autoplay restrictions
  }
};

// Check if Web Bluetooth is supported
export const isWebBluetoothSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
};

// Check if Web Serial is supported
export const isWebSerialSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
};

// Format formatted plain-text receipt for 58mm (32 chars) or 80mm (48 chars)
export const generatePlainTextReceipt = (
  tx: Transaction,
  settings: StoreSettings,
  paperWidth: '58mm' | '80mm' = '58mm'
): string => {
  const width = paperWidth === '58mm' ? 32 : 48;
  const divider = '-'.repeat(width);
  const doubleDivider = '='.repeat(width);

  const center = (text: string) => {
    if (text.length >= width) return text.substring(0, width);
    const leftPad = Math.floor((width - text.length) / 2);
    return ' '.repeat(leftPad) + text;
  };

  const padRow = (left: string, right: string) => {
    const spaceCount = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
  };

  const lines: string[] = [
    doubleDivider,
    center(settings.storeName.toUpperCase()),
    center(settings.storeAddress),
    center(`Telp: ${settings.storePhone}`),
    doubleDivider,
    padRow(`No: ${tx.id}`, tx.paymentMethod),
    padRow(`Tgl: ${tx.timestamp}`, `Kasir: ${tx.cashier.split(' ')[0]}`),
    divider,
  ];

  // Items
  tx.items.forEach((item) => {
    lines.push(item.name.substring(0, width));
    const qtyPrice = ` ${item.quantity} x ${formatRupiah(item.price)}`;
    const lineTotal = formatRupiah(item.price * item.quantity);
    lines.push(padRow(qtyPrice, lineTotal));
  });

  lines.push(divider);

  // Subtotal & Totals
  lines.push(padRow('Subtotal', formatRupiah(tx.subtotal)));
  if (tx.tax > 0) {
    lines.push(padRow(`Pajak (${Math.round(tx.taxRate * 100)}%)`, formatRupiah(tx.tax)));
  }
  lines.push(doubleDivider);
  lines.push(padRow('TOTAL BELANJA', formatRupiah(tx.total)));
  lines.push(padRow('Bayar (' + tx.paymentMethod + ')', formatRupiah(tx.amountPaid)));
  lines.push(padRow('Kembalian', formatRupiah(tx.change)));
  lines.push(divider);

  // Member info if applicable
  if (tx.memberName) {
    lines.push(padRow('Member:', tx.memberName));
    if (tx.memberTier) lines.push(padRow('Tier:', tx.memberTier));
    if (tx.pointsEarned) lines.push(padRow('Poin Didapat:', `+${tx.pointsEarned}`));
    lines.push(divider);
  }

  // Footer notes
  lines.push(center(settings.receiptFooter || 'Terima kasih atas kunjungan Anda'));
  lines.push(center('Barang yg dibeli tdk dpt ditukar'));
  lines.push(center('*** STRUK RESMI KASIRKU ***'));
  lines.push('\n\n\n'); // Feed lines

  return lines.join('\n');
};

// Generate test receipt for hardware diagnostic
export const generateTestReceipt = (
  device: PrinterDeviceInfo,
  settings: StoreSettings
): string => {
  const width = device.paperWidth === '58mm' ? 32 : 48;
  const divider = '='.repeat(width);

  const center = (text: string) => {
    if (text.length >= width) return text.substring(0, width);
    const leftPad = Math.floor((width - text.length) / 2);
    return ' '.repeat(leftPad) + text;
  };

  const padRow = (left: string, right: string) => {
    const spaceCount = Math.max(1, width - left.length - right.length);
    return left + ' '.repeat(spaceCount) + right;
  };

  return [
    divider,
    center('TEST PRINT PRINTER MINI'),
    center(device.name.toUpperCase()),
    divider,
    padRow('Tipe Koneksi:', device.type.toUpperCase()),
    padRow('Lebar Kertas:', device.paperWidth),
    padRow('Waktu Test:', new Date().toLocaleTimeString('id-ID')),
    padRow('Status:', 'SIAP CETAK (READY)'),
    divider,
    center('KASIRKU POINT OF SALE'),
    center(settings.storeName),
    divider,
    'Karakter font normal:\n0123456789 ABCDEFGHIJKLMNOPQRSTUVWXYZ\n',
    center('*** TES HARDWARE BERHASIL ***'),
    '\n\n\n',
  ].join('\n');
};

// Print via thermal receipt popup / browser print dialog with precise 58mm/80mm styling
export const printThermalWindow = (
  receiptText: string,
  paperWidth: '58mm' | '80mm' = '58mm'
) => {
  playPrinterBeep();

  const printWindow = window.open('', '_blank', 'width=350,height=600');
  if (!printWindow) {
    window.print();
    return;
  }

  const mmWidth = paperWidth === '58mm' ? '58mm' : '80mm';

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Thermal Receipt</title>
        <style>
          @page {
            size: ${mmWidth} auto;
            margin: 0;
          }
          body {
            font-family: 'Courier New', Courier, monospace, monospace;
            font-size: 11px;
            line-height: 1.25;
            width: ${mmWidth};
            max-width: ${mmWidth};
            margin: 0 auto;
            padding: 8px 6px;
            color: #000;
            background: #fff;
            white-space: pre-wrap;
            word-break: break-all;
          }
          @media print {
            body {
              width: 100%;
              margin: 0;
              padding: 4px;
            }
          }
        </style>
      </head>
      <body>
${receiptText}
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 700);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
};
