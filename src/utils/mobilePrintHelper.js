/**
 * Universal Mobile Print & Native Share Helper for Viotrack
 * Uses Capacitor share, filesystem, and printer plugins for native output,
 * with Web/Desktop fallbacks.
 */

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Printer } from '@capgo/capacitor-printer';

export const isNativeApp = () => {
  return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
};

export const isMobileDevice = () => {
  if (isNativeApp()) return true;
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|capacitor|cordova/i.test(userAgent);
  const isSmallScreen = window.innerWidth <= 768;
  return isMobileUA || (isTouch && isSmallScreen);
};

/**
 * Converts Blob to pure Base64 string (without the data URL prefix)
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = reader.result;
      if (typeof res === 'string') {
        const parts = res.split(',');
        resolve(parts[1] || parts[0]);
      } else {
        resolve('');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Direct file download helper without invoking system share tray
 */
export async function downloadBlobFile({
  filename,
  blob,
  mimeType = 'application/pdf'
}) {
  if (isNativeApp()) {
    try {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });
      return true;
    } catch (err) {
      console.warn('Native APK filesystem save failed, falling back to browser download:', err);
    }
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  } catch (err) {
    console.error('Direct download failed:', err);
    throw err;
  }
}

/**
 * Shares or saves any file natively via Capacitor or Web Share
 */
export async function shareOrSaveNativeFile({
  filename,
  blob,
  title = 'Viotrack Export',
  mimeType = 'application/octet-stream'
}) {
  // 1. Capacitor Native APK Execution (100% Reliable Android Native Share Tray)
  if (isNativeApp()) {
    try {
      const base64Data = await blobToBase64(blob);
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true
      });

      if (writeResult && writeResult.uri) {
        await Share.share({
          title: title,
          text: title,
          url: writeResult.uri,
          files: [writeResult.uri],
          dialogTitle: title
        });
        return true;
      }
    } catch (err) {
      if (err?.message?.includes('canceled') || err?.message?.includes('cancelled') || err?.name === 'AbortError') {
        return true;
      }
      console.warn('Capacitor native share failed, falling back to Web Share / Download:', err);
    }
  }

  // 2. Mobile Web Share API Execution (Mobile Chrome / Safari)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: title,
          text: title
        });
        return true;
      }
    } catch (shareErr) {
      if (shareErr.name === 'AbortError') return true;
      console.warn('Web share failed, falling back to standard download link:', shareErr);
    }
  }

  // 3. Desktop / Browser Download Fallback
  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.target = '_self';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 4000);
    return true;
  } catch (err) {
    console.error('Download link error:', err);
    throw err;
  }
}

/**
 * Opens the platform print interface on mobile and prints through a hidden
 * iframe on desktop browsers.
 */
export async function printOrShareDocument({
  title = 'Viotrack Document',
  filename = 'Viotrack_Document.pdf',
  htmlContent = '',
  generatePdfBlob,
  onStatus = () => {}
}) {
  if (isNativeApp() || isMobileDevice()) {
    try {
      let blob;
      if (typeof generatePdfBlob === 'function') {
        onStatus?.({ type: 'info', message: 'Generating document...' });
        const pdfOutput = await generatePdfBlob();
        if (pdfOutput instanceof Blob) {
          blob = pdfOutput;
        } else if (pdfOutput && typeof pdfOutput.output === 'function') {
          blob = pdfOutput.output('blob');
        } else if (pdfOutput instanceof ArrayBuffer) {
          blob = new Blob([pdfOutput], { type: 'application/pdf' });
        }

        if (!blob) {
          throw new Error('PDF generation did not return a printable document.');
        }

        await Printer.printBase64({
          name: title,
          data: await blobToBase64(blob),
          mimeType: 'application/pdf'
        });
      } else if (htmlContent) {
        await Printer.printHtml({ name: title, html: htmlContent });
      } else {
        throw new Error('No document content was provided for printing.');
      }

      onStatus?.({ type: 'success', message: 'Print preview opened.' });
      return;
    } catch (err) {
      if (err?.name === 'AbortError') return;
      console.error('Mobile print preview failed:', err);
      throw err;
    }
  }

  if (htmlContent) {
    try {
      onStatus?.({ type: 'info', message: 'Opening print dialog...' });
      const existing = document.getElementById('viotrack-print-frame');
      existing?.remove();

      const iframe = document.createElement('iframe');
      iframe.id = 'viotrack-print-frame';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '1px';
      iframe.style.height = '1px';
      iframe.style.opacity = '0.01';
      iframe.style.border = '0';
      iframe.style.pointerEvents = 'none';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();
      doc.write(htmlContent);
      doc.close();
      setTimeout(async () => {
        try {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          onStatus?.({ type: 'success', message: 'Print dialog opened.' });
          setTimeout(() => iframe.remove(), 3000);
        } catch (err) {
          console.warn('Iframe print failed, falling back to popup window:', err);
          const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const printWin = window.open(url, '_blank');
          if (printWin) {
            printWin.onload = () => {
              printWin.focus();
              printWin.print();
            };
            onStatus?.({ type: 'success', message: 'Print view opened in new tab.' });
          } else {
            try {
              await shareOrSaveNativeFile({
                filename: filename.endsWith('.html') ? filename : `${filename}.html`,
                blob,
                title,
                mimeType: 'text/html'
              });
              onStatus?.({ type: 'info', message: 'Print view downloaded.' });
            } catch (shareError) {
              console.error('Print view download fallback failed:', shareError);
              onStatus?.({ type: 'error', message: 'Unable to open or download the print view.' });
            }
          }
        }
      }, 350);
    } catch (err) {
      console.error('Desktop HTML print error:', err);
      throw err;
    }
    return;
  }

  if (typeof generatePdfBlob === 'function') {
    onStatus?.({ type: 'info', message: 'Generating PDF document...' });
    const pdfOutput = await generatePdfBlob();
    const blob = pdfOutput instanceof Blob
      ? pdfOutput
      : pdfOutput && typeof pdfOutput.output === 'function'
        ? pdfOutput.output('blob')
        : pdfOutput instanceof ArrayBuffer
          ? new Blob([pdfOutput], { type: 'application/pdf' })
          : null;

    if (!blob) {
      throw new Error('PDF generation did not return a printable document.');
    }

    await shareOrSaveNativeFile({
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      blob,
      title,
      mimeType: 'application/pdf'
    });
    onStatus?.({ type: 'success', message: 'PDF document downloaded.' });
  }
}
