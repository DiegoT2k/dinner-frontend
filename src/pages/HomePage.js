import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

function HomePage() {
  const [dinners, setDinners] = useState([]);

  const loadDinners = async () => {
    const res = await fetch(`${API_URL}/dinner/all`);
    const data = await res.json();
    setDinners(data);
  };

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  useEffect(() => {
    loadDinners();
  }, []);

const formatDate = (iso) => {
  // "2025-01-10T20:00:00" → "2025-01-10"
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
  // "2025-01-10T20:00:00" → "20:00"
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

  return (
    <div className="container">
      <div className="top-bar">
        <h1 className="title">🍝 Cene dalla Nonna</h1>
        <Link to="/by-name" className="admin-button">Piatti più frequenti</Link>
        <Link to="/admin" className="admin-button">Admin</Link>

      </div>


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
                      {grouped[year][month].map((d) => {


                        return (
                          <li key={d.id} className="dinner-card">
                            <div className="dinner-card-title">{d.name}</div>

                            <div className="dinner-card-divider"></div>

<div className="dinner-card-date">📅 {formatDate(d.date)}</div>
<div className="dinner-card-time">⏰ {formatTime(d.date)}</div>


                          </li>
                        );
                      })}
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
