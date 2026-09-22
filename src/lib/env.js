/** Build-time feature flags, kept out of components so fast refresh stays clean. */
export const GOOGLE_ENABLED = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
