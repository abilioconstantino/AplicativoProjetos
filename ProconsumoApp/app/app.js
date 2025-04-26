import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { createClient } from "@supabase/supabase-js";
import { useNavigation } from "@react-navigation/native";

// 🔑 Coloque suas credenciais aqui
const supabaseUrl = "https://mjhnkskrmelshxdslerz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaG5rc2tybWVsc2h4ZHNsZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDg1MjEsImV4cCI6MjA2MTE4NDUyMX0.v-TTk-_y725XZ53humKLL-9VWL8qjbqubyrkXxro3Rc";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  const navigation = useNavigation(); // Obtém o objeto navigation

  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar projetos:", error);
      } else {
        setProjects(data);
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  }

  async function confirmDelete(projectId) {
    Alert.alert(
      "Excluir Projeto",
      "Tem certeza que deseja excluir este projeto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("projects")
                .delete()
                .eq("id", projectId);
  
              if (error) {
                console.error("Erro ao excluir projeto:", error);
              } else {
                fetchProjects(); // Atualiza a lista de projetos
              }
            } catch (err) {
              console.error("Erro inesperado ao excluir:", err);
            }
          },
        },
      ]
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Explore projetos criativos</Text>

      {projects.length > 0 ? (
        projects.map((project) => (
          <View style={styles.card} key={project.id}>
            {project.image ? (
              <Image source={{ uri: project.image }} style={styles.image} />
            ) : null}
            <Text style={styles.cardTitle}>{project.title}</Text>
            <Text style={styles.cardDescription}>{project.description}</Text>
            <Text style={styles.cardAuthor}>por {project.author}</Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDelete(project.id)}
            >
              <Image
                source={require("../assets/images/lata-de-lixo.png")}
                style={styles.deleteIcon}
              />
            </TouchableOpacity>
          </View>
        ))
      ) : (
        <Text>Nenhum projeto encontrado.</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("NewProject")} // Navega para a tela "Novo Projeto"
      >
        <Text style={styles.buttonText}>Publicar projeto</Text>
      </TouchableOpacity>
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
