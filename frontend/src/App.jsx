import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/Transactions';
import PoliciesPage from './pages/Policies';
import MLExplainerPage from './pages/MLExplainerPage';
import FuturePlanPage from './pages/FuturePlanPage';
import Login from './components/Login';

const ProtectedRoute = ({ isAuth, children }) => {
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for persistent token
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuth(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    setIsAuth(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuth(false);
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-50 text-slate-400">Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={
          isAuth ? <Navigate to="/" replace /> : <Login onLogin={handleLogin} />
        } />

        <Route path="/" element={
          <ProtectedRoute isAuth={isAuth}>
            <Layout onLogout={handleLogout} />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="policies" element={<PoliciesPage />} />
          <Route path="model-explain" element={<MLExplainerPage />} />
          <Route path="future-plan" element={<FuturePlanPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
