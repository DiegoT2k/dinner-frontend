import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

function AdminPage() {
  const [dinners, setDinners] = useState([]);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [editingId, setEditingId] = useState(null);

  const loadDinners = async () => {
    const res = await fetch(`${API_URL}/dinner/admin/all`);
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
      await fetch(`${API_URL}/dinner/admin/createDinner`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    } else {
      await fetch(`{API_URL}/dinner/admin/update/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
    }

    resetForm();
    loadDinners();
  };

  const deleteDinner = async (id) => {
    await fetch(`${API_URL}/dinner/admin/delete/${id}`, {
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

        <div className="admin-dinner-list">
          {dinners.map((d) => {
            const dateObj = new Date(d.date);
            const formattedDate = dateObj.toLocaleDateString("it-IT");
            const formattedTime = dateObj.toLocaleTimeString("it-IT", {
              hour: "2-digit",
              minute: "2-digit"
            });

            return (
              <div key={d.id} className="admin-dinner-card">
                <div className="admin-dinner-info">
                  <h3>{d.name}</h3>
                  <p>📅 {formattedDate}</p>
                  <p>⏰ {formattedTime}</p>
                </div>

                <div className="admin-dinner-actions">
                  <button onClick={() => startEditing(d)}>✏️ Modifica</button>
                  <button className="danger" onClick={() => deleteDinner(d.id)}>🗑️ Elimina</button>
                </div>
              </div>
            );
          })}
        </div>


      </div>

    </div>
  );
}

export default AdminPage;
