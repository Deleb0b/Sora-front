/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />
/// <reference types="vite-plugin-pwa/info" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_MOCK_FAILURE_RATE?: string;
  readonly VITE_MOCK_LATENCY_MIN?: string;
  readonly VITE_MOCK_LATENCY_MAX?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
