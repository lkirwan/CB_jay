import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import ClientPage from './pages/ClientPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<ClientPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
