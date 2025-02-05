/* Copyright G. Hemingway, 2024 - All rights reserved */

"use strict";

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import PropTypes from "prop-types";

// Background gradient animation
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Main container
const MainContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  animation: ${gradientAnimation} 8s infinite;
  padding: 1em;
  color: #f7ff00;
`;

// Styled Section for Game Details
const SectionWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  margin: 1em auto;
  padding: 1em;
  background-color: rgba(28, 28, 28, 0.9);
  border-radius: 12px;
  border: 2px solid ${({ borderColor }) => borderColor || "#005eff"};
  box-shadow: 0 0 15px ${({ borderColor }) => borderColor || "#005eff"};
`;

// Styled Table
const StyledTable = styled.table`
  width: 100%;
  margin: 1em auto;
  border-collapse: collapse;
  border: 1px solid #005eff;
  text-align: center;
  color: #f7ff00;

  th,
  td {
    padding: 0.8em;
    border: 1px solid #005eff;
  }

  th {
    background-color: #1a1a40;
    color: #00ffff;
  }

  tr:hover {
    background-color: rgba(0, 94, 255, 0.2);
  }
`;

// Styled Button
const StyledButton = styled.button`
  display: inline-block;
  margin-top: 1em;
  padding: 0.8em 1.2em;
  font-size: 1em;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
  color: #000;
  background-color: #f7ff00;
  text-decoration: none;
  border-radius: 8px;
  box-shadow: 0 0 10px #f7ff00;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00ffff;
    color: #000;
    box-shadow: 0 0 15px #00ffff;
  }
`;
const MoveButton = styled.button`
  padding: 0.5em 1em;
  font-size: 1em;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
  color: #000;
  background-color: #f7ff00;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px #f7ff00;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00ffff;
    color: #000;
    box-shadow: 0 0 15px #00ffff;
  }
`;
const GameDetail = ({ start, moves, score, cards_remaining, active, gameId }) => {
  const duration = start ? Math.round((Date.now() - new Date(start)) / 1000) : "--";
  return (
    <SectionWrapper borderColor="#005eff">
      <h4>Game Details</h4>
      <p><strong>Game ID:</strong> <Link to={`/game/${gameId}`}>{gameId}</Link></p>
      <p><strong>Duration:</strong> {duration} seconds</p>
      <p><strong>Number of Moves:</strong> {moves?.length || 0}</p>
      <p><strong>Points:</strong> {score || 0}</p>
      <p><strong>Cards Remaining:</strong> {cards_remaining || "--"}</p>
      <p><strong>Status:</strong> {active ? "Active" : "Complete"}</p>
    </SectionWrapper>
  );
};

GameDetail.propTypes = {
  start: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  moves: PropTypes.array.isRequired,
  score: PropTypes.number.isRequired,
  cards_remaining: PropTypes.number.isRequired,
  active: PropTypes.bool.isRequired,
  gameId: PropTypes.string.isRequired,
};

const Move = ({ move, index, onMoveClick }) => {
  const moveDate = move.date ? new Date(move.date) : null;
  const formattedDate = moveDate ? moveDate.toLocaleString() : "--";
  const playerName = move.user
    ? `${move.user.first_name || ""} ${move.user.last_name || ""}`.trim() || "Unknown Player"
    : "Unknown Player";

  return (
    <tr onClick={() => onMoveClick(index)} style={{ cursor: "pointer" }}>
      <td>{index + 1}</td>
      <td>{formattedDate}</td>
      <td>{playerName}</td>
      <td>
        <MoveButton onClick={() => onMoveClick(index)}>
          {move.cards?.length ? `Moved ${move.cards.length} card(s)` : "No details available"}
        </MoveButton>
      </td>

    </tr>
  );
};

Move.propTypes = {
  move: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  onMoveClick: PropTypes.func.isRequired,
};

const MovesList = ({ moves, onMoveClick }) => {
  if (!moves || moves.length === 0) {
    return <p>No moves available for this game.</p>;
  }

  const moveElements = moves.map((move, index) => (
    <Move key={index} move={move} index={index} onMoveClick={onMoveClick} />
  ));

  return (
    <SectionWrapper borderColor="#9d00ff">
      <h4>Moves</h4>
      <StyledTable>
        <thead>
          <tr>
            <th>Move #</th>
            <th>Time</th>
            <th>Player</th>
            <th>Move Details</th>
          </tr>
        </thead>
        <tbody>{moveElements}</tbody>
      </StyledTable>
    </SectionWrapper>
  );
};

export const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState({
    start: 0,
    score: 0,
    cards_remaining: 0,
    active: true,
    moves: [],
  });
  const [viewedState, setViewedState] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/v1/game/${id}?moves=true`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch game data.");
        return res.json();
      })
      .then((data) => {
        console.log("Game Data:", data);
        setGame(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load game data. Please try again.");
      });
  }, [id]);

  const handleMoveClick = (index) => {
    const selectedMoveState = game.moves[index]?.state;
    if (selectedMoveState) {
      // Redirect to game page with the move index as a query parameter
      navigate(`/game/${id}?moveIndex=${index}`);
    } else {
      setViewedState("State not available for this move.");
    }
  };

  if (error) {
    return (
      <MainContainer>
        <p style={{ color: "red" }}>{error}</p>
      </MainContainer>
    );
  }

  return (
    <MainContainer>
      <GameDetail {...game} gameId={id} />
      <MovesList moves={game.moves} onMoveClick={handleMoveClick} />
      {viewedState && (
        <SectionWrapper borderColor="#f7ff00">
          <h4>State after selected move:</h4>
          <pre>{JSON.stringify(viewedState, null, 2)}</pre>
        </SectionWrapper>
      )}
      <StyledButton onClick={() => navigate(`/game/${id}`)}>Back to Game</StyledButton>
    </MainContainer>
  );
};
