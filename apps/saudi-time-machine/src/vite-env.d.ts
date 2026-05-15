/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PLAUSIBLE_DOMAIN?: string;
  readonly VITE_PLAUSIBLE_HOST?: string;
  readonly VITE_SITE_ORIGIN?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
