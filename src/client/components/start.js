/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState } from "react";
import styled, { keyframes } from "styled-components";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

// Gradient animation for background
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Main container
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: ${gradientAnimation} 10s infinite;
  color: #f7ff00;
  @media (min-width: 768px) {
    padding: 3em; 
  }

  @media (min-width: 1200px) {
    padding: 5em; 
  }
`;

// Form container
const FormContainer = styled.div`
  background-color: rgba(28, 28, 28, 0.95);
  padding: 2em;
  border-radius: 12px;
  box-shadow: 0 0 20px #005eff;
  border: 2px solid #9d00ff;
  max-width: 400px;
  width: 90%;
  text-align: center;
  @media (min-width: 768px) {
    max-width: 500px;
    padding: 3em;
  }

  @media (min-width: 1200px) {
    max-width: 600px;
    padding: 4em;
  }
`;

// Form header
const FormHeader = styled.h2`
  font-size: 1.8em;
  font-family: "Orbitron", sans-serif;
  color: #f7ff00;
  text-shadow: 0 0 8px #f7ff00, 0 0 15px #005eff;
  margin-bottom: 1em;

  @media (max-width: 768px) {
    font-size: 1.5em;
  }

  @media (min-width: 1200px) {
    font-size: 2em;
  }
`;

const FormLabel = styled.label`
  font-size: 1.2em;
  color: #00ffff;
  margin-bottom: 0.5em;
  display: block;
  font-family: "Roboto Mono", monospace;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 0.8em;
  margin-bottom: 1em;
  font-size: 1em;
  font-family: "Roboto Mono", monospace;
  font-weight: bold;
  color: #f7ff00;
  background-color: #1c1c1c;
  border: 2px solid #9d00ff;
  border-radius: 8px;
  box-shadow: 0 0 5px #9d00ff;
  outline: none;

  &:focus {
    border-color: #005eff;
    box-shadow: 0 0 10px #005eff;
  }
  @media (max-width: 768px) {
    font-size: 0.9em; 
  }

  @media (min-width: 1200px) {
    font-size: 1.2em; 
  }
`;

// Button with neon effects
const FormButton = styled.button`
  width: 100%;
  padding: 0.8em;
  margin-top: 0.5em;
  font-size: 1.2em;
  font-weight: bold;
  color: #000;
  background-color: #f7ff00;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 10px #f7ff00;

  &:hover {
    background-color: #00ffff;
    box-shadow: 0 0 15px #00ffff;
  }
  @media (max-width: 768px) {
    font-size: 1em; 
  }

  @media (min-width: 1200px) {
    font-size: 1.4em; 
  }
`;

// Error message
const ErrorMessage = styled.p`
  color: red;
  font-weight: bold;
  text-align: center;
`;

// Game options
const gameNames = [
  "klondike",
  "pyramid",
  "canfield",
  "golf",
  "yukon",
  "hearts",
];

const Start = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    game: "klondike",
    draw: "Draw 1",
    color: "Red",
  });
  const [error, setError] = useState("");

  const onSubmit = async (ev) => {
    ev.preventDefault();
    const response = await fetch("/v1/game", {
      body: JSON.stringify({
        game: state.game,
        draw: state.draw,
        color: state.color,
      }),
      method: "POST",
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
    });
    const data = await response.json();
    if (response.ok) {
      navigate(`/game/${data.id}`);
    } else {
      setError(`Error: ${data.error}`);
    }
  };

  const onChange = (ev) => {
    setState({
      ...state,
      [ev.target.name]: ev.target.value,
    });
  };

  return (
    <MainContainer>
      <FormContainer>
        <FormHeader>Create a New Game</FormHeader>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={onSubmit}>
          <FormLabel htmlFor="game">Select Game:</FormLabel>
          <FormSelect
            id="game"
            name="game"
            onChange={onChange}
            value={state.game}
          >
            {gameNames.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </FormSelect>
          <FormLabel htmlFor="draw">Draw:</FormLabel>
          <FormSelect
            id="draw"
            name="draw"
            onChange={onChange}
            value={state.draw}
            disabled={state.game === "hearts"}
          >
            <option value="Draw 1">Draw 1</option>
            <option value="Draw 3">Draw 3</option>
          </FormSelect>
          <FormLabel htmlFor="color">Card Color:</FormLabel>
          <FormSelect
            id="color"
            name="color"
            onChange={onChange}
            value={state.color}
          >
            <option value="Red">Red</option>
            <option value="Green">Green</option>
            <option value="Blue">Blue</option>
            <option value="Magical">Magical</option>
          </FormSelect>
          <FormButton type="submit">Start Game</FormButton>
        </form>
      </FormContainer>
    </MainContainer>
  );
};

export default Start;
