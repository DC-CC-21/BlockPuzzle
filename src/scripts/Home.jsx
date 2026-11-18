import React from "react";
import { data as cardData } from "../data";

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
