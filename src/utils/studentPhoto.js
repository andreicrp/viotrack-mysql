const PLACEHOLDER_IMAGE_HOSTS = new Set([
  'images.unsplash.com',
  'ui-avatars.com'
]);

export const getStudentPhoto = value => {
  if (typeof value !== 'string') return '';
  const image = value.trim();
  if (!image) return '';
  if (/^data:image\//i.test(image) || /^blob:/i.test(image) || /^\/(?!\/)/.test(image)) {
    return image;
  }

  try {
    const url = new URL(image);
    if (PLACEHOLDER_IMAGE_HOSTS.has(url.hostname.toLowerCase())) return '';
    if (url.protocol === 'http:' || url.protocol === 'https:') return image;
  } catch {
    return '';
  }

  return '';
};
