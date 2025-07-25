import React from "react";
// import { createRoot } from "react-dom/client";

// const root = createRoot(document.querySelector("body"));

const cardData = [
  {
    id: 1,
    level: 1,
    pieces: {
      1: "A",
      3: "B",
      3: "C",
      4: "D",
      6: "E",
      2: "F",
      11: "G",
    },
  },
  {
    id: 2,
    level: 1,
    pieces: {
      4: "A",
      6: "B",
      1: "C",
      3: "D",
      6: "E",
      2: "F",
      7: "G",
    },
  },
];

export default function CardList() {
  return (
    <div className="card-list">
      {cardData.map((card) => (
        <Card key={card.id} cardData={card} />
      ))}
    </div>
  );
}

function Card({ cardData }) {
  return (
    <a className="card" href={`cube?level=${cardData.id}`}>
      <div className="card-container">
        <span className="card-level">Level {cardData.level}</span>
        <span className="card-challenge">Challenge #</span>
        <span className="card-id">{cardData.id}</span>
        <div className="card-pieces">
          <p>Pieces </p>
          {Object.entries(cardData.pieces).map(([key, value]) => (
            <span key={key}>{value}</span>
          ))}
        </div>
      </div>
    </a>
  );
}

// root.render(<CardList />);
