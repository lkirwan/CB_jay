import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import ClientPage from './pages/ClientPage';
import DashboardPage from './pages/DashboardPage';
import FacilitatorLoginPage from './pages/FacilitatorLoginPage';
import WorldCupPathPage from './pages/WorldCupPathPage';
import './App.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <div className="app-wrapper">
          <Header />
          <main className="app-main">
            <Routes>
              <Route path="/" element={<ClientPage />} />
              <Route path="/login" element={<FacilitatorLoginPage />} />
              <Route path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/worldcup" element={<WorldCupPathPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
