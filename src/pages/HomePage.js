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
                          <li key={d.id} className="dinner-card">
                            <div className="dinner-card-title">{d.name}</div>

                            <div className="dinner-card-divider"></div>

                            <div className="dinner-card-date">📅 {formattedDate}</div>
                            <div className="dinner-card-time">⏰ {formattedTime}</div>
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
