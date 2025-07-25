import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import CardList from "./scripts/Home";
import Cube from "./scripts/Cube";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CardList />} />
        <Route path="/cube" element={<Cube />} />
      </Routes>
    </BrowserRouter>
  );
}
