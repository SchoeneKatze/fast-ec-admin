import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LogtoProvider, type LogtoConfig } from "@logto/react";

const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT;
const appId = import.meta.env.VITE_LOGTO_APP_ID;

if (!endpoint || !appId) {
  console.error('Missing Logto configuration. Please set VITE_LOGTO_ENDPOINT and VITE_LOGTO_APP_ID in .env.local');
}

const config: LogtoConfig = {
  endpoint: endpoint || 'https://xtt3qa.logto.app',
  appId: appId || 'kiqyn7rvlf1yg9orl70pg',
  scopes: ["profile", "email"],
  // redirectUri: `${window.location.origin}/`,
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogtoProvider config={config}>
      <App />
    </LogtoProvider>
  </StrictMode>,
);
