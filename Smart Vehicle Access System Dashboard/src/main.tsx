import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { GateProvider } from './context/GateContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <GateProvider>
          <App />
        </GateProvider>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>
);
