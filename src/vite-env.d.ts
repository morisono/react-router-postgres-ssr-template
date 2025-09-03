/// <reference types="vite/client" />

declare module '*.tsx' {
  import React from 'react';
  const component: React.ComponentType<any>;
  export default component;
}

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_EMAIL_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}