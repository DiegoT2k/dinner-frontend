import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

function HomePage() {
  const [dinners, setDinners] = useState([]);
  const [nextDinner, setNextDinner] = useState(null);
  const [nextDessert, setNextDessert] = useState(null);
  const [nextAttendance, setNextAttendance] = useState([]);

  // ============================
  // LOAD ALL DINNERS
  // ============================
  const loadDinners = async () => {
    const res = await fetch(`${API_URL}/dinner/all`);
    const data = await res.json();

    // Per ogni cena, carichiamo dessert e presenze
    const enriched = await Promise.all(
      data.map(async (d) => {
const dessertRes = await fetch(`${API_URL}/dessert/byDinner/${d.id}`);
let dessert = null;

try {
  const text = await dessertRes.text();
  dessert = text ? JSON.parse(text) : null;
} catch (e) {
  dessert = null;
}


        const attRes = await fetch(`${API_URL}/attendance/byDinner/${d.id}`);
        const attendance = await attRes.json();

        return {
          ...d,
          dessert,
          attendance
        };
      })
    );

    setDinners(enriched);
  };

  // ============================
  // LOAD NEXT DINNER
  // ============================
  const loadNextDinner = async () => {
    const res = await fetch(`${API_URL}/dinner/next`);
    const text = await res.text();

    if (!text) {
      setNextDinner(null);
      return;
    }

    const data = JSON.parse(text);

    if (!data || Object.keys(data).length === 0) {
      setNextDinner(null);
    } else {
      setNextDinner(data);
      loadNextDessert(data.id);
      loadNextAttendance(data.id);
    }
  };

  // ============================
  // LOAD DESSERT FOR NEXT DINNER
  // ============================
  const loadNextDessert = async (dinnerId) => {
    const res = await fetch(`${API_URL}/dessert/byDinner/${dinnerId}`);
    const text = await res.text();
    setNextDessert(text ? JSON.parse(text) : null);
  };

  // ============================
  // LOAD ATTENDANCE FOR NEXT DINNER
  // ============================
  const loadNextAttendance = async (dinnerId) => {
    const res = await fetch(`${API_URL}/attendance/byDinner/${dinnerId}`);
    const data = await res.json();
    setNextAttendance(data);
  };

  // ============================
  // INIT
  // ============================
  useEffect(() => {
    loadDinners();
    loadNextDinner();
  }, []);

  // ============================
  // HELPERS
  // ============================
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  const formatDate = (iso) => {
    const [datePart] = iso.split("T");
    const [year, month, day] = datePart.split("-");
    const d = new Date(year, month - 1, day);

    return d.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  };

  const formatTime = (iso) => {
    const [, timePart] = iso.split("T");
    const [hour, minute] = timePart.split(":");
    return `${hour}:${minute}`;
  };

  const groupByYearMonth = (list) => {
    const groups = {};

    list.forEach((d) => {
      const date = new Date(d.date);
      const year = date.getFullYear();
      const month = capitalize(date.toLocaleString("it-IT", { month: "long" }));

      if (!groups[year]) groups[year] = {};
      if (!groups[year][month]) groups[year][month] = [];

      groups[year][month].push(d);
    });

    return groups;
  };

  const grouped = groupByYearMonth(dinners);

  // ============================
  // RENDER
  // ============================
  return (
    <div className="container">

      {/* TOP BAR */}
      <div className="top-bar">
        <h1 className="title">🍝 Cene dalla Nonna</h1>
        <Link to="/by-name" className="admin-button">Piatti più frequenti</Link>
        <Link to="/admin" className="admin-button">Admin</Link>
      </div>

      {/* COMING SOON */}
      {nextDinner ? (
        <div className="coming-soon-wrapper">
          <div className="coming-soon-card">
            <div className="coming-icon">⏳</div>
            <h2 className="coming-title">Coming Soon..</h2>

            <p className="coming-name">{nextDinner.name}</p>

            {(() => {
              const [fullDate, fullTime] = nextDinner.date.split("T");
              const [year, month, day] = fullDate.split("-");
              const [hour, minute] = fullTime.split(":");

              return (
                <div className="coming-details">
                  <p>📅 {day}/{month}/{year}</p>
                  <p>⏰ {hour}:{minute}</p>
                </div>
              );
            })()}

            {/* DESSERT */}
            {nextDessert && (
              <div className="coming-extra">
                <p>🍰 Dessert: <strong>{nextDessert.name}</strong></p>
                <p>👨‍🍳 Preparato da: <strong>{nextDessert.madeBy}</strong></p>
              </div>
            )}

            {/* PRESENZE */}
            {nextAttendance.length > 0 && (
              <div className="coming-extra">
                <p>👥 Presenti:</p>
                {nextAttendance.map((a) => (
                  <p key={a.id}>✔ {a.user.name} {a.user.surname}</p>
                ))}
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="coming-soon-wrapper">
          <div className="coming-soon-card">
            <div className="coming-icon">🍽️</div>
            <h2 className="coming-title">Coming Soon..</h2>
            <p className="coming-name">Nessuna cena in programma</p>
          </div>
        </div>
      )}

      {/* LISTA CENE */}
      <div className="card">
        {Object.keys(grouped)
          .sort((a, b) => b - a)
          .map((year) => (
            <div key={year}>
              <h2 className="year-title">📅 {year}</h2>

              {Object.keys(grouped[year])
                .sort(
                  (a, b) =>
                    new Date(`${b} 1, ${year}`) -
                    new Date(`${a} 1, ${year}`)
                )
                .map((month) => (
                  <div key={month}>
                    <h3 className="month-title">{month}</h3>

                    <ul className="dinner-list">
                      {grouped[year][month].map((d) => (
                        <li key={d.id} className="dinner-card">
                          <div className="dinner-card-title">{d.name}</div>

                          <div className="dinner-card-divider"></div>

                          <div className="dinner-card-date">📅 {formatDate(d.date)}</div>
                          <div className="dinner-card-time">⏰ {formatTime(d.date)}</div>

                          {/* DESSERT */}
                          {d.dessert && (
                            <div className="dinner-card-dessert">
                              🍰 <strong>{d.dessert.name}</strong> — {d.dessert.madeBy}
                            </div>
                          )}

                          {/* PRESENZE */}
                          {d.attendance.length > 0 && (
                            <div className="dinner-card-attendance">
                              👥 {d.attendance.length} presenti:
                              <ul>
{d.attendance.map((a) => (
  <li key={a.id}>
    ✔ {a.userName} {a.userSurname}
  </li>
))}

                              </ul>
                            </div>
                          )}

                        </li>
                      ))}
                    </ul>

                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
}

export default HomePage;
