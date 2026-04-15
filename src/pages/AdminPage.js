import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";

function AdminPage() {
  const [dinners, setDinners] = useState([]);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [editingId, setEditingId] = useState(null);

  const loadDinners = async () => {
    const res = await fetch("http://localhost:8080/dinner/admin/all");
    const data = await res.json();
    setDinners(data);
  };

  useEffect(() => {
    loadDinners();
  }, []);

  const resetForm = () => {
    setName("");
    setDate("");
    setTime("");
    setEditingId(null);
  };

  const createOrUpdateDinner = async (e) => {
    e.preventDefault();

    const isoDateTime = `${date}T${time}:00`;
    const body = { name, date: isoDateTime };

    if (editingId === null) {
      await fetch("http://localhost:8080/dinner/admin/createDinner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } else {
      await fetch(`http://localhost:8080/dinner/admin/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    resetForm();
    loadDinners();
  };

  const deleteDinner = async (id) => {
    await fetch(`http://localhost:8080/dinner/admin/delete/${id}`, {
      method: "DELETE"
    });
    loadDinners();
  };

  const startEditing = (dinner) => {
    setEditingId(dinner.id);
    setName(dinner.name);

    const d = new Date(dinner.date);
    setDate(d.toISOString().slice(0, 10));
    setTime(d.toISOString().slice(11, 16));
  };

  return (
    <div className="container">

      <div className="top-bar">
        <h1 className="title">🔧 Gestione Cene</h1>
        <Link to="/" className="admin-button">Home</Link>
      </div>

      <div className="card">
        <h2>{editingId ? "Modifica Cena" : "Aggiungi Cena"}</h2>

        <form onSubmit={createOrUpdateDinner} className="form">

          <div className="form-group">
            <label className="form-label">Nome della cena</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Es. Cena di Natale"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Data</label>
            <input
              className="input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Orario</label>
            <input
              className="input"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
          </div>

          <button className="button" type="submit">
            {editingId ? "💾 Salva Modifica" : "➕ Aggiungi Cena"}
          </button>

          {editingId && (
            <button
              type="button"
              className="cancel-button"
              onClick={resetForm}
            >
              ❌ Annulla
            </button>
          )}
        </form>
      </div>

      <div className="card">
        <h2>Cene Esistenti</h2>

        <ul className="dinner-list">
          {dinners.map((d) => (
            <li key={d.id} className="dinner-item">
              <div className="dinner-name">{d.name}</div>
              <div className="dinner-date">{d.date}</div>

              <button className="edit-button" onClick={() => startEditing(d)}>
                ✏️
              </button>

              <button className="delete-button" onClick={() => deleteDinner(d.id)}>
                🗑️
              </button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}

export default AdminPage;
