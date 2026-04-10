import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [dinners, setDinners] = useState([]);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // Carica tutte le cene
  const loadDinners = async () => {
    const res = await fetch("http://localhost:8080/dinner/all");
    const data = await res.json();
    setDinners(data);
  };

  // Crea una nuova cena
  const createDinner = async (e) => {
    e.preventDefault();

    const isoDateTime = `${date}T${time}:00`;

    const body = {
      name: name,
      date: isoDateTime
    };

    await fetch("http://localhost:8080/dinner/createDinner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setName("");
    setDate("");
    setTime("");

    loadDinners();
  };

  useEffect(() => {
    loadDinners();
  }, []);

  // Formatta la data in modo leggibile
  const formatDateTime = (iso) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Raggruppa per anno e mese
  const groupByYearMonth = (list) => {
    const groups = {};

    list.forEach((d) => {
      const date = new Date(d.date);
      if (isNaN(date.getTime())) return;

      const year = date.getFullYear();
      const month = date.toLocaleString("it-IT", { month: "long" });

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];

      groups[year][month].push(d);
    });

    return groups;
  };

  const grouped = groupByYearMonth(dinners);

  return (
    <div className="container">
      <h1 className="title">🍽️ Dinner Manager</h1>

      <div className="card">
        <h2>Lista Dinner</h2>

        {Object.keys(grouped)
          .sort((a, b) => b - a) // anni decrescenti
          .map((year) => (
            <div key={year}>
              <h2 className="year-title">📅 {year}</h2>

              {Object.keys(grouped[year])
                .sort(
                  (a, b) =>
                    new Date(`${b} 1, ${year}`) -
                    new Date(`${a} 1, ${year}`)
                ) // mesi decrescenti
                .map((month) => (
                  <div key={month}>
                    <h3 className="month-title">{month}</h3>

                    <ul className="dinner-list">
                      {grouped[year][month].map((d, i) => (
                        <li key={i} className="dinner-item">
                          <div className="dinner-name">{d.name}</div>
                          <div className="dinner-date">
                            {formatDateTime(d.date)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ))}
      </div>

      <div className="card">
        <h2>Nuovo Dinner</h2>
        <form onSubmit={createDinner} className="form">
          <label>Nome</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label>Data</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />

          <label>Orario</label>
          <input
            className="input"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />

          <button className="button" type="submit">
            ➕ Crea Dinner
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
