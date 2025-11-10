import React, { useState } from "react";
import {
  View,
  Button,
  Image,
  Alert,
  TextInput,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { CheckCircle, Clock, XCircle, Loader } from "lucide-react";

export default function CameraUpload() {
  const [photos, setPhotos] = useState<any[]>([]);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [validity, setValidity] = useState("");
  const [price, setPrice] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);

  // 📸 Captura uma nova foto ou arquivo
  const handleTakePhoto = async () => {
    try {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";

      input.onchange = async (event: any) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;

          const newPhoto = {
            id: Date.now(),
            file,
            preview: base64,
            status: "Na fila",
            result: "",
          };

          setPhotos((prev) => [newPhoto, ...prev]);
          await queueImageToAI(newPhoto);
        };

        reader.readAsDataURL(file);
      };

      input.click();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir a câmera.");
    }
  };

  // 🚀 Envia imagem pra IA (fila)
  const queueImageToAI = async (photo: any) => {
    try {
      const formData = new FormData();
      formData.append("file", photo.file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/ocr`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!data.job_id) throw new Error("Falha ao criar job");

      updatePhotoStatus(photo.id, "Processando IA");

      // 🔁 Checa resultado a cada 5 segundos
      const interval = setInterval(async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/result/${data.job_id}`);
        const result = await res.json();

        if (result.status === "done") {
          clearInterval(interval);
          updatePhotoResult(photo.id, result.text);
          setSelectedPhoto(photo);
          setDialogVisible(true);
        }

        if (result.status === "error") {
          clearInterval(interval);
          updatePhotoStatus(photo.id, "Erro");
          Alert.alert("Erro no OCR", result.error || "Falha desconhecida.");
        }
      }, 5000);
    } catch (error) {
      console.error(error);
      updatePhotoStatus(photo.id, "Erro");
    }
  };

  // 🔄 Atualiza status
  const updatePhotoStatus = (id: number, status: string) => {
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
  };

  // 🧠 Atualiza resultado OCR
  const updatePhotoResult = (id: number, result: string) => {
    setPhotos((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: "Concluído", result } : p
      )
    );
  };

  // 💾 Confirma dados da caixa de diálogo
  const handleConfirm = () => {
    if (!quantity) {
      Alert.alert("Atenção", "A quantidade é obrigatória.");
      return;
    }

    console.log({
      quantidade: quantity,
      validade: validity,
      preco: price || "-",
      ocr: selectedPhoto?.result || "Sem texto OCR",
    });

    setDialogVisible(false);
    Alert.alert("Sucesso", "Informações adicionadas à lista!");
  };

  // 🎨 Ícone dinâmico de status
  const renderStatusIcon = (status: string) => {
    switch (status) {
      case "Na fila":
        return <Clock color="#fbbf24" size={20} />; // amarelo
      case "Processando IA":
        return <Loader color="#3b82f6" size={20} className="animate-spin" />; // azul
      case "Concluído":
        return <CheckCircle color="#22c55e" size={20} />; // verde
      case "Erro":
        return <XCircle color="#ef4444" size={20} />; // vermelho
      default:
        return <Clock color="#9ca3af" size={20} />;
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          textAlign: "center",
          marginBottom: 15,
        }}
      >
        Fila de Fotos para OCR
      </Text>

      <Button title="📸 Tirar Nova Foto" onPress={handleTakePhoto} />

      {photos.map((photo) => (
        <View
          key={photo.id}
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: "#fff",
            borderRadius: 10,
            elevation: 2,
            shadowColor: "#000",
          }}
        >
          <Image
            source={{ uri: photo.preview }}
            style={{ width: "100%", height: 200, borderRadius: 10 }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 10,
            }}
          >
            {renderStatusIcon(photo.status)}
            <Text style={{ marginLeft: 8, fontWeight: "bold" }}>
              {photo.status}
            </Text>
          </View>

          {photo.result && (
            <Text
              style={{
                marginTop: 5,
                color: "#333",
                backgroundColor: "#f1f1f1",
                padding: 5,
                borderRadius: 5,
              }}
            >
              {photo.result}
            </Text>
          )}
        </View>
      ))}

      {/* Caixa de diálogo */}
      <Modal visible={dialogVisible} animationType="slide" transparent={true}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "85%",
            }}
          >
            <Text
              style={{
                fontSize: 18,
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Informações do Remédio
            </Text>

            <TextInput
              placeholder="Quantidade"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 6,
              }}
            />

            <TextInput
              placeholder="Validade (MM/AA)"
              value={validity}
              onChangeText={(text) => {
                if (text.length === 2 && !text.includes("/")) setValidity(text + "/");
                else setValidity(text);
              }}
              keyboardType="numeric"
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 6,
              }}
            />

            <TextInput
              placeholder="Preço (R$)"
              value={price}
              onChangeText={(text) => {
                const numeric = text.replace(/[^0-9]/g, "");
                const formatted = (parseInt(numeric, 10) / 100).toFixed(2).replace(".", ",");
                setPrice(formatted === "NaN" ? "" : formatted);
              }}
              keyboardType="numeric"
              style={{
                borderBottomWidth: 1,
                marginBottom: 10,
                padding: 6,
              }}
            />

            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: "#4CAF50",
                padding: 10,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirmar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDialogVisible(false)}
              style={{
                backgroundColor: "#999",
                padding: 10,
                borderRadius: 6,
                marginTop: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
