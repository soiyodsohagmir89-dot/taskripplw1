import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initializeBackend } from './services/mockBackend';

// Ensure mock backend is initialized (creates Admin user if missing)
initializeBackend();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// AI Studio always uses an `index.tsx` file for all project types.
