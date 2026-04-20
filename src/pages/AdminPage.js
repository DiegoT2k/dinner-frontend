import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

function AdminPage() {
  const [dinners, setDinners] = useState([]);

  // Cena
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Dessert
  const [dessertName, setDessertName] = useState("");
  const [dessertMadeBy, setDessertMadeBy] = useState("");

  // Presenze
  const [attendanceUsers, setAttendanceUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);

  // ============================
  // LOAD DATA
  // ============================
  const loadDinners = async () => {
    const res = await fetch(`${API_URL}/dinner/admin/all`);
    const data = await res.json();
    setDinners(data);
  };

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/users/all`);
    const data = await res.json();
    setAllUsers(data);
  };

  useEffect(() => {
    loadDinners();
    loadUsers();
  }, []);


const removeAttendance = async (userId) => {
  if (!editingId) return;

  await fetch(`${API_URL}/attendance/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      dinnerId: editingId,
      userId: Number(userId)
    })
  });

  await reloadEditingDinner(editingId);
};


  // ============================
  // RELOAD SINGLE DINNER
  // ============================
  const reloadEditingDinner = async (id) => {
    const res = await fetch(`${API_URL}/dinner/admin/all`);
    const data = await res.json();
    setDinners(data);

    const updated = data.find(d => d.id === id);
    if (updated) {
      setEditingId(updated.id);
      setName(updated.name);

      const [fullDate, fullTime] = updated.date.split("T");
      const [year, month, day] = fullDate.split("-");
      const [hour, minute] = fullTime.split(":");

      setDate(`${year}-${month}-${day}`);
      setTime(`${hour}:${minute}`);

      if (updated.dessert) {
        setDessertName(updated.dessert.name);
        setDessertMadeBy(updated.dessert.madeBy);
      } else {
        setDessertName("");
        setDessertMadeBy("");
      }

      setAttendanceUsers(updated.attendees || []);
    }
  };

  // ============================
  // CRUD CENA
  // ============================
  const resetForm = () => {
    setName("");
    setDate("");
    setTime("");
    setEditingId(null);
    setDessertName("");
    setDessertMadeBy("");
    setAttendanceUsers([]);
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
      await fetch(`${API_URL}/dinner/admin/update/${editingId}`, {
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

    const [fullDate, fullTime] = dinner.date.split("T");
    const [year, month, day] = fullDate.split("-");
    const [hour, minute] = fullTime.split(":");

    setDate(`${year}-${month}-${day}`);
    setTime(`${hour}:${minute}`);

    // Dessert
    if (dinner.dessert) {
      setDessertName(dinner.dessert.name);
      setDessertMadeBy(dinner.dessert.madeBy);
    } else {
      setDessertName("");
      setDessertMadeBy("");
    }

    // Presenze
    setAttendanceUsers(dinner.attendees || []);
  };

  // ============================
  // DESSERT
  // ============================
  const assignDessert = async () => {
    if (!editingId) return;

    await fetch(`${API_URL}/dessert/assign/${editingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: dessertName,
        madeBy: dessertMadeBy
      })
    });

    await reloadEditingDinner(editingId);
  };

  // ============================
  // PRESENZE
  // ============================
  const addAttendance = async (userId) => {
    if (!editingId) return;

    await fetch(`${API_URL}/attendance/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dinnerId: editingId,
        userId: Number(userId)
      })
    });

    await reloadEditingDinner(editingId);
  };

  // ============================
  // RENDER
  // ============================
  return (
    <div className="container">

      <div className="top-bar">
        <h1 className="title">🔧 Gestione Cene</h1>
        <Link to="/" className="admin-button">Home</Link>
      </div>

      {/* FORM CENA */}
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

      {/* LISTA CENE */}
      <div className="card">
        <h2>Cene Esistenti</h2>

        <div className="admin-dinner-list">
          {dinners.map((d) => {
            const [fullDate, fullTime] = d.date.split("T");
            const [year, month, day] = fullDate.split("-");
            const [hour, minute] = fullTime.split(":");

            return (
              <div key={d.id} className="admin-dinner-card">
                <div className="admin-dinner-info">
                  <h3>{d.name}</h3>
                  <p>📅 {day}/{month}/{year}</p>
                  <p>⏰ {hour}:{minute}</p>
                </div>

                <div className="admin-dinner-actions">
                  <button type="button" onClick={() => startEditing(d)}>✏️ Modifica</button>

                  <button className="danger" onClick={() => deleteDinner(d.id)}>🗑️ Elimina</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DESSERT */}
      {editingId && (
        <div className="card">
          <h2>🍰 Dessert della Cena</h2>

          <input
            className="input"
            placeholder="Nome dessert"
            value={dessertName}
            onChange={(e) => setDessertName(e.target.value)}
          />

          <input
            className="input"
            placeholder="Fatto da"
            value={dessertMadeBy}
            onChange={(e) => setDessertMadeBy(e.target.value)}
          />

          <button className="button" onClick={assignDessert}>
            Salva Dessert
          </button>
        </div>
      )}

      {/* PRESENZE */}
      {editingId && (
        <div className="card">
          <h2>👥 Presenze</h2>

          <select className="input" onChange={(e) => addAttendance(e.target.value)}>
            <option value="">Aggiungi utente...</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} {u.surname}
              </option>
            ))}
          </select>

          <h3>Presenti:</h3>
{attendanceUsers.map((a) => (
  <div key={a.id} className="attendance-row">
    <span>✔ {a.userName} {a.userSurname}</span>

    <button
      type="button"
      className="danger"
      onClick={() => removeAttendance(a.userId)}
    >
      ❌
    </button>
  </div>
))}

        </div>
      )}

    </div>
  );
}

export default AdminPage;
