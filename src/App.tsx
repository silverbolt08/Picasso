import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import { ThemeProvider } from './theme/ThemeProvider';
import { OrchestrationProvider } from './state/OrchestrationContext';

export default function App() {
  return (
    <ThemeProvider>
      <OrchestrationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </OrchestrationProvider>
    </ThemeProvider>
  );
}
