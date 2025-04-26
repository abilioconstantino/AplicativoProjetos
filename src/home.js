import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mjhnkskrmelshxdslerz.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaG5rc2tybWVsc2h4ZHNsZXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2MDg1MjEsImV4cCI6MjA2MTE4NDUyMX0.v-TTk-_y725XZ53humKLL-9VWL8qjbqubyrkXxro3Rc";
const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qaG5rc2tybWVsc2h4ZHNsZXJ6Iiwicm9zZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTYwODUyMSwiZXhwIjoyMDYxMTg0NTIxfQ.S2jwKWXB_74XQ9qpgBhBOnsEqeFbH-GG0k3cuBNmUUU"; // Use apenas no backend seguro
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProconsumoApp() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", image: "" });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    if (error) console.error("Erro ao buscar projetos:", error);
    else setProjects(data);
  }

  async function handlePublish() {
    if (!newProject.title || !newProject.description) {
      console.error("Título e descrição são obrigatórios.");
      return;
    }

    try {
      let imageUrl = null;

      if (imageFile) {
        const { data, error: uploadError } = await supabase.storage
          .from("project-images")
          .upload(`images/${Date.now()}_${imageFile.name}`, imageFile);

        if (uploadError) {
          console.error("Erro ao fazer upload da imagem:", uploadError);
          return;
        }

        imageUrl = data.path ? supabase.storage.from("project-images").getPublicUrl(data.path).data.publicUrl : null;
      }

      const { error } = await supabase.from("projects").insert([
        { ...newProject, image: imageUrl, author: "Você" }
      ]);

      if (error) {
        console.error("Erro ao publicar projeto:", error);
      } else {
        console.log("Projeto publicado com sucesso!");
        setNewProject({ title: "", description: "", image: "" });
        setImageFile(null);
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
        console.log("Projeto excluído com sucesso!");
        fetchProjects(); // Atualiza a lista de projetos
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>Explore projetos criativos</div>

      {projects.map((project) => (
        <div style={styles.card} key={project.id}>
          <img src={project.image || "/placeholder.jpg"} alt="Projeto" style={styles.image} />
          <div style={styles.cardTitle}>{project.title}</div>
          <div style={styles.cardDescription}>{project.description}</div>
          <div style={styles.cardAuthor}>por {project.author}</div>
          <button
            style={styles.deleteButton}
            onClick={() => handleDelete(project.id)}
          >
            🗑️
          </button>
        </div>
      ))}

      {!showForm && (
        <button style={styles.button} onClick={() => setShowForm(true)}>
          Publicar projeto
        </button>
      )}

      {showForm && (
        <div>
          <div style={styles.header}>Novo Projeto</div>
          <input
            type="text"
            placeholder="Nome do projeto"
            style={styles.input}
            value={newProject.title}
            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
          />
          <textarea
            placeholder="Descrição"
            style={styles.input}
            value={newProject.description}
            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
          ></textarea>
          <input
            type="file"
            accept="image/*"
            style={styles.input}
            onChange={(e) => setImageFile(e.target.files[0])}
          />
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button style={styles.button} onClick={handlePublish}>Publicar</button>
            <button style={styles.outlineButton} onClick={() => setShowForm(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "480px",
    margin: "0 auto",
    padding: "1rem",
    fontFamily: "sans-serif",
    backgroundColor: "#fffaf1",
    color: "#222",
  },
  header: {
    fontSize: "1.8rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  card: {
    background: "#fff",
    borderRadius: "1rem",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    padding: "1rem",
    marginBottom: "1rem",
  },
  image: {
    width: "100%",
    borderRadius: "0.5rem",
    marginBottom: "0.5rem",
  },
  cardTitle: {
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  cardDescription: {
    fontSize: "0.9rem",
    color: "#666",
  },
  cardAuthor: {
    fontSize: "0.8rem",
    color: "#999",
    marginTop: "0.5rem",
  },
  button: {
    backgroundColor: "#f7931e",
    color: "white",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1rem",
  },
  outlineButton: {
    background: "none",
    color: "#f7931e",
    border: "1px solid #f7931e",
    padding: "0.75rem 1.5rem",
    borderRadius: "0.5rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1rem",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    marginBottom: "1rem",
    borderRadius: "0.5rem",
    border: "1px solid #ddd",
    fontSize: "1rem",
  },
  deleteButton: {
    background: "none",
    border: "none",
    color: "#f00",
    fontSize: "1.5rem",
    cursor: "pointer",
    marginTop: "0.5rem",
  },
};
