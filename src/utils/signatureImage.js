export const readSignatureImage = (file) => new Promise((resolve, reject) => {
  if (!file) return resolve('');
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    reject(new Error('Choose a PNG or JPG signature image.'));
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    reject(new Error('Signature images must be 2 MB or smaller.'));
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const source = typeof reader.result === 'string' ? reader.result : '';
    if (!source) return resolve('');

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) return resolve(source);
      context.drawImage(image, 0, 0);

      const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
      let left = canvas.width;
      let top = canvas.height;
      let right = -1;
      let bottom = -1;
      for (let y = 0; y < canvas.height; y += 1) {
        for (let x = 0; x < canvas.width; x += 1) {
          const pixel = (y * canvas.width + x) * 4;
          const [red, green, blue, alpha] = data.slice(pixel, pixel + 4);
          const isInk = alpha > 18 && (red < 238 || green < 238 || blue < 238);
          if (isInk) {
            left = Math.min(left, x);
            top = Math.min(top, y);
            right = Math.max(right, x);
            bottom = Math.max(bottom, y);
          }
        }
      }

      if (right < left || bottom < top) return resolve(source);
      const horizontalMargin = Math.max(4, Math.round((right - left + 1) * 0.05));
      const verticalMargin = Math.max(4, Math.round((bottom - top + 1) * 0.12));
      left = Math.max(0, left - horizontalMargin);
      top = Math.max(0, top - verticalMargin);
      right = Math.min(canvas.width - 1, right + horizontalMargin);
      bottom = Math.min(canvas.height - 1, bottom + verticalMargin);

      const cropped = document.createElement('canvas');
      cropped.width = right - left + 1;
      cropped.height = bottom - top + 1;
      cropped.getContext('2d')?.drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height);
      resolve(cropped.toDataURL('image/png'));
    };
    image.onerror = () => resolve(source);
    image.src = source;
  };
  reader.onerror = () => reject(new Error('Could not read the signature image.'));
  reader.readAsDataURL(file);
});

export const signatureImageFormat = (dataUrl) => {
  if (dataUrl?.startsWith('data:image/jpeg')) return 'JPEG';
  return 'PNG';
};
