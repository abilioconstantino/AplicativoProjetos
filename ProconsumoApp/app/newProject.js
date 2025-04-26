import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, SafeAreaView } from "react-native";
import * as ImagePicker from "expo-image-picker"; // Importação necessária
import { supabase } from "../supabase"; // Importe o cliente do Supabase

export default function NewProject({ navigation }) {
  const [showForm, setShowForm] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", image: null });

  const pickImage = async () => {
    // Solicitar permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      alert("Permissão para acessar a galeria é necessária!");
      return;
    }

    // Abrir o seletor de imagens
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setNewProject({ ...newProject, image: result.assets[0] }); // Atualiza o estado com a imagem selecionada
    }
  };

  const handlePublish = async () => {
    // Validação dos campos
    if (!newProject.title || !newProject.description) {
      alert("Por favor, preencha todos os campos obrigatórios!");
      return;
    }

    try {
      // Inserir dados no Supabase
      const { data, error } = await supabase.from("projects").insert([
        {
          title: newProject.title,
          description: newProject.description,
          image: newProject.image ? newProject.image.uri : null,
        },
      ]);

      if (error) {
        console.error("Erro ao salvar no Supabase:", error);
        alert("Erro ao publicar o projeto. Tente novamente.");
        return;
      }

      alert("Projeto publicado com sucesso!");
      setNewProject({ title: "", description: "", image: null }); // Limpa o formulário
      setShowForm(false); // Fecha o formulário

      // Navegar de volta para a tela principal
      navigation.navigate("Home"); // Substitua "App" pelo nome correto da sua tela principal
    } catch (error) {
      console.error("Erro ao publicar:", error);
      alert("Ocorreu um erro ao tentar publicar o projeto.");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Novo projeto</Text>
      </View>

      <View style={styles.formContainer}>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {newProject.image ? (
            <Image source={{ uri: newProject.image.uri }} style={styles.imagePreview} />
          ) : (
            <Text style={styles.imagePickerText}>Adicionar foto</Text>
          )}
        </TouchableOpacity>

        <TextInput
          placeholder="Nome do projeto"
          style={styles.input}
          value={newProject.title}
          onChangeText={(text) => setNewProject({ ...newProject, title: text })}
        />
        <TextInput
          placeholder="Descrição"
          style={[styles.input, styles.textArea]}
          multiline
          value={newProject.description}
          onChangeText={(text) => setNewProject({ ...newProject, description: text })}
        />

        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publicar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f8f4ff",
  },
  container: {
    flex: 1,
    backgroundColor: "#f8f4ff",
    paddingHorizontal: 20,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    fontSize: 24,
    color: "#6c63ff",
    marginRight: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6c63ff",
  },
  formContainer: {
    flex: 1,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
  },
  imagePicker: {
    backgroundColor: "#e0d7ff",
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: 20,
  },
  imagePickerText: {
    color: "#6c63ff",
    fontSize: 16,
  },
  imagePreview: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  publishButton: {
    backgroundColor: "#6c63ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  publishButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});