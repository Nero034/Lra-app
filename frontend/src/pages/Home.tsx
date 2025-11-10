// frontend/src/pages/Home.tsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">🏠 LRA App - Painel Principal</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-80">
        <button
          onClick={() => navigate("/camera")}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg shadow w-full"
        >
          📷 Enviar Imagem (OCR)
        </button>

        <button
          onClick={() => navigate("/list")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg shadow w-full"
        >
          📋 Visualizar Lista
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow w-full"
        >
          ⚙️ Configurações
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow w-full"
        >
          🚪 Sair
        </button>
      </div>

      <footer className="mt-8 text-gray-400 text-sm">
        <p>Desenvolvido por Luan e Jureminha 💚</p>
      </footer>
    </div>
  );
}
