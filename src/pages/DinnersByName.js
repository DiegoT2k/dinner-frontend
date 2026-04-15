import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { API_URL } from "../config";

function DinnersByName() {
  const [dinners, setDinners] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/dinner/admin/all`)
      .then((res) => res.json())
      .then((data) => setDinners(data));
  }, []);

  const groupByName = (list) => {
    const map = {};

    list.forEach((d) => {
      if (!map[d.name]) {
        map[d.name] = { count: 0, dinners: [] };
      }
      map[d.name].count++;
      map[d.name].dinners.push(d);
    });

    return map;
  };

  const grouped = groupByName(dinners);

  const sortedNames = Object.keys(grouped).sort(
    (a, b) => grouped[b].count - grouped[a].count
  );

  return (
    <div className="container">

      <div className="top-bar">
        <h1 className="title">🍽️ Piatti più frequenti</h1>
        <Link to="/" className="admin-button">Home</Link>
      </div>

      <div className="card">
        {sortedNames.map((name) => (
          <div key={name} className="dinner-card">
            <div className="dinner-card-title">
              {name} — <span style={{ color: "#ff7f50" }}>{grouped[name].count} volte</span>
            </div>

            <div className="dinner-card-divider"></div>

            {grouped[name].dinners.map((d) => {
              const dateObj = new Date(d.date);

              const formattedDate = dateObj.toLocaleDateString("it-IT", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric"
              });

              const formattedTime = dateObj.toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit"
              });

              return (
                <div key={d.id} className="dinner-card-date">
                  📅 {formattedDate} — ⏰ {formattedTime}
                </div>
              );
            })}
          </div>
        ))}
      </div>

    </div>
  );
}

export default DinnersByName;
