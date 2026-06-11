import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './lib/staticMock'; // must run before ./lib/auth wraps fetch
import './lib/auth';
import App from './App.tsx';
import LoginGate from './LoginGate.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoginGate>
      <App />
    </LoginGate>
  </StrictMode>,
);
