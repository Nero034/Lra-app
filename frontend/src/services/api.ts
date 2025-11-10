export const API_BASE_URL = "https://lra-app-0uq6.onrender.com";



// frontend/src/services/api.ts

/**
 * Serviço central de comunicação com o backend do LRA App.
 * Este arquivo define a base da API e as funções auxiliares
 * para chamadas HTTP ao backend hospedado no Render.
 */

export const API_BASE_URL = "https://lra-app-0uq6.onrender.com"; // URL do backend ativo no Render

/**
 * Função genérica para requisições HTTP.
 * @param endpoint Caminho da rota (ex: /api/ai/ocr)
 * @param options Configuração da requisição (método, body, headers, etc.)
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {
    "Accept": "application/json",
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, mergedOptions);

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro ${response.status}: ${errorData}`);
    }

    // Se for JSON, tenta converter
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }

    // Caso contrário, retorna texto bruto
    return await response.text();

  } catch (error: any) {
    console.error(`❌ Erro ao chamar ${endpoint}:`, error.message || error);
    throw error;
  }
}

/**
 * Função específica para enviar imagem à IA via OCR.
 * Retorna o job_id para acompanhar o processamento.
 * @param file Arquivo de imagem capturado ou selecionado
 */
export async function sendImageToOCR(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/api/ai/ocr", {
    method: "POST",
    body: formData,
  });
}

/**
 * Função para verificar o status de um job OCR.
 * Retorna o texto extraído assim que o processamento for concluído.
 * @param jobId ID retornado pela rota /api/ai/ocr
 */
export async function getOCRStatus(jobId: string) {
  return apiFetch(`/api/ai/status/${jobId}`, {
    method: "GET",
  });
}

/**
 * Verifica se o backend está online.
 * Pode ser usada na tela de login ou inicialização do app.
 */
export async function checkHealth() {
  try {
    const data = await apiFetch("/health");
    console.log("✅ Backend online:", data);
    return data;
  } catch (error) {
    console.error("⚠️ Falha ao verificar backend:", error);
    return null;
  }
}
