import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LogtoProvider, type LogtoConfig } from "@logto/react";

const endpoint = import.meta.env.VITE_LOGTO_ENDPOINT;
const appId = import.meta.env.VITE_LOGTO_APP_ID;

const config: LogtoConfig = {
  endpoint: endpoint,
  appId: appId,
  scopes: ["profile", "email"],
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LogtoProvider config={config}>
      <App />
    </LogtoProvider>
  </StrictMode>,
);
