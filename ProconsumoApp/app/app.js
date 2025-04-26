import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createClient } from "@supabase/supabase-js";

// 🔑 Coloque suas credenciais aqui
const supabaseUrl = "https://mjhnkskrmelshxdslerz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaG5rc2tybWVsc2h4ZHNsZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDg1MjEsImV4cCI6MjA2MTE4NDUyMX0.v-TTk-_y725XZ53humKLL-9VWL8qjbqubyrkXxro3Rc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", image: null });

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) console.error("Erro ao buscar projetos:", error);
    else setProjects(data);
  }

  async function handlePublish() {
    if (!newProject.title || !newProject.description) return;

    try {
      let imageUrl = null;

      if (newProject.image) {
        const file = newProject.image;
        const fileName = `${Date.now()}_${file.uri.split("/").pop()}`;

        // Corrigindo o envio do arquivo
        const { data, error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(`images/${fileName}`, {
            uri: file.uri,
            type: "image/jpeg", // Certifique-se de que o tipo MIME está correto
            name: fileName,
          });

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          return;
        }

        imageUrl = data.path
          ? supabase.storage.from("project-images").getPublicUrl(data.path).data.publicUrl
          : null;
      }

      const { error } = await supabase.from("projects").insert([
        { ...newProject, image: imageUrl, author: "Você" },
      ]);

      if (error) {
        console.error("Erro ao publicar projeto:", error);
      } else {
        setNewProject({ title: "", description: "", image: null });
        setShowForm(false);
        fetchProjects();
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  }

  async function handleDelete(projectId) {
    try {
      const { error } = await supabase.from("projects").delete().eq("id", projectId);
      if (error) {
        console.error("Erro ao excluir projeto:", error);
      } else {
        setProjects(projects.filter((project) => project.id !== projectId));
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewProject({ ...newProject, image: result.assets[0] });
    }
  }

  async function confirmDelete(projectId) {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza de que deseja excluir este projeto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => handleDelete(projectId),
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Explore projetos criativos</Text>

      {projects.map((project) => (
        <View style={styles.card} key={project.id}>
          {project.image ? <Image source={{ uri: project.image }} style={styles.image} /> : null}
          <Text style={styles.cardTitle}>{project.title}</Text>
          <Text style={styles.cardDescription}>{project.description}</Text>
          <Text style={styles.cardAuthor}>por {project.author}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => confirmDelete(project.id)}
          >
            <Image
              source={require('../assets/images/lata-de-lixo.png')} // Caminho relativo correto
              style={styles.deleteIcon}
            />
          </TouchableOpacity>
        </View>
      ))}

      {!showForm && (
        <TouchableOpacity style={styles.button} onPress={() => setShowForm(true)}>
          <Text style={styles.buttonText}>Publicar projeto</Text>
        </TouchableOpacity>
      )}

      {showForm && (
        <View>
          <Text style={styles.header}>Novo Projeto</Text>
          <TextInput
            placeholder="Nome do projeto"
            style={styles.input}
            value={newProject.title}
            onChangeText={(text) => setNewProject({ ...newProject, title: text })}
          />
          <TextInput
            placeholder="Descrição"
            style={styles.input}
            multiline
            value={newProject.description}
            onChangeText={(text) => setNewProject({ ...newProject, description: text })}
          />
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Selecionar Imagem</Text>
          </TouchableOpacity>
          {newProject.image && (
            <Image source={{ uri: newProject.image.uri }} style={styles.previewImage} />
          )}
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TouchableOpacity style={styles.button} onPress={handlePublish}>
              <Text style={styles.buttonText}>Publicar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineButton} onPress={() => setShowForm(false)}>
              <Text style={styles.outlineButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fffaf1",
    alignItems: "stretch",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#222",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: "#666",
  },
  cardAuthor: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },
  input: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#f7931e",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#f7931e",
    borderRadius: 10,
    padding: 12,
    alignItems: "center",
    marginTop: 10,
    flex: 1,
  },
  outlineButtonText: {
    color: "#f7931e",
    fontWeight: "bold",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 10,
  },
  deleteButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    padding: 5,
  },
  deleteIcon: {
    width: 24, // Largura do ícone
    height: 24, // Altura do ícone
    tintColor: "#666", // Cor neutra para o ícone (opcional, remova se não quiser alterar a cor)
  },
});
