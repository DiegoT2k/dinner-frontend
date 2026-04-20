import React, { useEffect, useState } from "react";
import { API_URL } from "../config";

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/users/all`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const createUser = async () => {
    await fetch(`${API_URL}/users/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, surname, email })
    });

    setName("");
    setSurname("");
    setEmail("");
    loadUsers();
  };

  return (
    <div className="container">
      <h1>Gestione Utenti</h1>

      <div className="card">
        <h2>Aggiungi Utente</h2>

        <input className="input" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input" placeholder="Cognome" value={surname} onChange={(e) => setSurname(e.target.value)} />
        <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <button className="button" onClick={createUser}>➕ Crea Utente</button>
      </div>

      <div className="card">
        <h2>Lista Utenti</h2>
        {users.map(u => (
          <p key={u.id}>{u.name} {u.surname} — {u.email}</p>
        ))}
      </div>
    </div>
  );
}

export default UsersPage;
