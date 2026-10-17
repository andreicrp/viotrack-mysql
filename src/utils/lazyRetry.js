import { lazy } from 'react';

const RETRY_STORAGE_KEY = 'chunk_reload_retry';

export const lazyRetry = (componentImport) =>
  lazy(async () => {
    let hasRefreshed;
    try {
      hasRefreshed = window.sessionStorage.getItem(RETRY_STORAGE_KEY);
    } catch {
      hasRefreshed = true;
    }

    try {
      const module = await componentImport();
      try {
        window.sessionStorage.removeItem(RETRY_STORAGE_KEY);
      } catch {}
      return { default: module.default || module[Object.keys(module)[0]] };
    } catch (error) {
      console.warn('Dynamic chunk import error encountered:', error);
      const isChunkError =
        error?.message?.includes('dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.message?.includes('MIME type') ||
        error?.name === 'ChunkLoadError' ||
        error?.name === 'TypeError';

      if (isChunkError && !hasRefreshed) {
        try {
          window.sessionStorage.setItem(RETRY_STORAGE_KEY, String(Date.now()));
        } catch {
          throw error;
        }
        window.location.reload();
        return new Promise(() => {});
      }

      throw error;
    }
  });

export default lazyRetry;