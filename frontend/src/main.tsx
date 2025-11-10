// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CameraUpload from "./pages/CameraUpload";
import ListView from "./pages/ListView";
import Settings from "./pages/Settings";
import "./styles.css";

// Simulação de autenticação simples (pode ser expandida futuramente)
const isAuthenticated = () => {
  return localStorage.getItem("loggedIn") === "true";
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => (
  <Router>
    <Routes>
      {/* Página de Login */}
      <Route path="/" element={<Login />} />

      {/* Páginas protegidas */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
// frontend/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CameraUpload from "./pages/CameraUpload";
import ListView from "./pages/ListView";
import Settings from "./pages/Settings";
import "./styles.css";

// Simulação de autenticação simples (pode ser expandida futuramente)
const isAuthenticated = () => {
  return localStorage.getItem("loggedIn") === "true";
};

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => (
  <Router>
    <Routes>
      {/* Página de Login */}
      <Route path="/" element={<Login />} />

      {/* Páginas protegidas */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/camera"
        element={
          <ProtectedRoute>
            <CameraUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/list"
        element={
          <ProtectedRoute>
            <ListView />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Redireciona qualquer rota inválida para o login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Router>
);

// Monta o React app
ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

