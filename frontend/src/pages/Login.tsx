// frontend/src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Simulação simples de login — pode ser integrada ao backend depois
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Aqui futuramente pode entrar a chamada para o backend:
      // const response = await fetch(`${API_BASE_URL}/api/auth/login`, {...})
      // se quiser usar login real.

      if (username.trim() === "" || password.trim() === "") {
        alert("Por favor, preencha usuário e senha.");
        return;
      }

      // Simulação de autenticação
      if (username === "admin" && password === "1234") {
        localStorage.setItem("loggedIn", "true");
        navigate("/home");
      } else {
        alert("Usuário ou senha incorretos!");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao tentar fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">🔐 Login - LRA App</h1>

      <form
        onSubmit={handleLogin}
        className="bg-gray-800 p-6 rounded-xl shadow-md w-80 flex flex-col gap-4"
      >
        <div>
          <label className="block text-sm mb-1">Usuário</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Digite seu usuário"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Senha</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Digite sua senha"
            className="w-full p-2 rounded bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold p-2 rounded-lg shadow"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-400">
        Dica: use <b>admin / 1234</b> para testar 🚀
      </p>
    </div>
  );
}
