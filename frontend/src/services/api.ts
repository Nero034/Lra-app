// frontend/src/services/api.ts

export const API_BASE_URL = "https://lra-app-0uq6.onrender.com"; // Render backend URL

// 🔹 Envia imagem para o backend fazer OCR via IA
export async function sendImageToAI(imageFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", imageFile);

  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/ocr`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Erro na resposta: ${text}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error("Erro ao enviar imagem:", error);
    throw error;
  }
}

// 🔹 Consulta o status do OCR
export async function checkOCRStatus(jobId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/status/${jobId}`);
    if (!response.ok) {
      throw new Error(`Erro no status: ${response.status}`);
    }
    return await response.json();
  } catch (error: any) {
    console.error("Erro ao checar status:", error);
    throw error;
  }
}
