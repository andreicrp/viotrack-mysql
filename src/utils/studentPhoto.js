const PLACEHOLDER_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'ui-avatars.com'
]);

const getPhoto = (value, { allowAdminPresets = false } = {}) => {
  if (typeof value !== 'string') return '';
  const image = value.trim();
  if (!image) return '';
  if (/^data:image\//i.test(image) || /^blob:/i.test(image) || /^\/(?!\/)/.test(image)) {
    return image;
  }

  try {
    const url = new URL(image);
    const hostname = url.hostname.toLowerCase();
    if (PLACEHOLDER_IMAGE_HOSTS.has(hostname)
      && !(allowAdminPresets && hostname === 'images.unsplash.com')) return '';
    if (url.protocol === 'http:' || url.protocol === 'https:') return image;
  } catch {
    return '';
  }

  return '';
};

export const getStudentPhoto = value => getPhoto(value);

// Admin profile presets are intentional profile photos, unlike generic
// placeholder portraits in student records.
export const getAdminProfilePhoto = value => {
  if (typeof value === 'string'
    && /(?:^|\/)(?:phcm-logo2?|viotrack-logo-nobg)\.(?:png|webp|jpe?g)(?:[?#].*)?$/i.test(value.trim())) {
    return '';
  }
  return getPhoto(value, { allowAdminPresets: true });
};
