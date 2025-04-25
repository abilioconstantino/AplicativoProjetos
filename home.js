import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://SEU-PROJECTO-ID.supabase.co";
const supabaseAnonKey = "SUA-ANON-KEY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ProconsumoApp() {
  const [showForm, setShowForm] = useState(false);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ title: "", description: "", image: "" });

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
    const { error } = await supabase.from("projects").insert([
      { ...newProject, author: "Você" }
    ]);
    if (error) console.error("Erro ao publicar projeto:", error);
    else {
      setNewProject({ title: "", description: "", image: "" });
      setShowForm(false);
      fetchProjects();
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
            type="text"
            placeholder="URL da imagem"
            style={styles.input}
            value={newProject.image}
            onChange={(e) => setNewProject({ ...newProject, image: e.target.value })}
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
};
