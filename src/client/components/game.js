// /* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Pile } from "./pile.js";
import { useLocation } from "react-router-dom";

// Background gradient animation
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

const GameContainer = styled.div`
  min-height: 100vh; 
  width: 100%; 

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; 
  animation: ${gradientAnimation} 8s infinite;
  padding: 1em;
  color: #f7ff00;
  box-sizing: border-box;
`;
const GameBase = styled.div`
  width: 95%;
  max-width: 1400px;
  min-height: 70vh;
  margin-top: 7em;
  padding: 1.5em; 
  background-color: rgba(28, 28, 28, 0.9);
  border-radius: 12px;
  border: 2px solid #9d00ff;
  box-shadow: 0 0 15px #9d00ff;
  box-sizing: border-box;
`;


const CardRow = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: flex-start;
  margin-bottom: 2em;
`;
const CardRowGap = styled.div`
  flex-grow: 2;
`;

const ActionButton = styled.button`
  margin: 10px;
  padding: 0.8em 1.2em;
  font-size: 1em;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
  background-color: #005eff;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-shadow: 0 0 8px #005eff;
  transition: all 0.3s ease;

  &:hover {
    background-color: #9d00ff;
    box-shadow: 0 0 15px #9d00ff;
  }

  &:disabled {
    background-color: #b0bec5;
    cursor: not-allowed;
    box-shadow: none;
  }
`;
const MovesLeftText = styled.div`
  text-align: center;
  font-size: 1.2em;
  margin-bottom: 1em;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

const ModalContent = styled.div`
  position: relative;
  margin: auto;
  top: 20%;
  background-color: #1c1c1c;
  padding: 2em;
  border-radius: 12px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 0 15px #9d00ff;
  border: 2px solid #9d00ff;
`;

const ResultsButton = styled.button`
  display: block;
  margin: 1em auto;
  margin-top: 7em;
  padding: 0.8em 1.2em;
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

const SmallModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1000;
`;

const SmallModalContent = styled.div`
  position: relative;
  margin: auto;
  top: 30%;
  background-color: #1c1c1c;
  padding: 1em;
  border-radius: 8px;
  width: 80%;
  max-width: 300px;
  text-align: center;
  box-shadow: 0 0 10px #9d00ff;
  border: 2px solid #9d00ff;
  color: #f7ff00;
`;

const CloseButton = styled.button`
  margin-top: 1em;
  padding: 0.5em 1em;
  font-size: 0.9em;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
  color: #000;
  background-color: #f7ff00;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 8px #f7ff00;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #00ffff;
    color: #000;
    box-shadow: 0 0 10px #00ffff;
  }
`;




export const Game = () => {
  const { id: gameID } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState(null);
  const [selected, setSelected] = useState(null);
  const [dragSource, setDragSource] = useState(null);
  const [lastValidState, setLastValidState] = useState(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isAutocompleting, setIsAutocompleting] = useState(false);
  const [gameResult, setGameResult] = useState(null); // 'won' or 'lost'
  const [movesLeft, setMovesLeft] = useState(100);
  const [errorMessage, setErrorMessage] = useState(null);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const moveIndex = queryParams.get("moveIndex");


  useEffect(() => {
    const getGameState = async () => {
      try {
        let url = `/v1/game/${gameID}`;
        if (moveIndex !== null) {
          url += `?moveIndex=${moveIndex}`;
        }

        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setState(data);
          setLastValidState(data);
        } else {
          console.error("Failed to fetch game state");
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    };
    getGameState();


    const handleKeyUp = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keyup", handleKeyUp);
    return () => window.removeEventListener("keyup", handleKeyUp);
  }, [gameID, moveIndex]);

  const handleCardClick = (card, pile, index) => {
    if (isGameOver || isAutocompleting) return;
    if (selected) {
      const move = {
        cards: selected.cards,
        src: selected.source,
        dst: pile,
      };
      sendMoveRequest(move);
      setSelected(null);
    } else if (card.up) {
      let cardsToMove;
      if (pile === "discard") {
        cardsToMove = [card];
      } else {
        cardsToMove = state[pile].slice(index);
      }
      setSelected({ cards: cardsToMove, source: pile });
    }
  };

  const handleDrawFromStock = async () => {
    if (isGameOver || isAutocompleting) return;

    try {
      const response = await fetch(`/v1/game/${gameID}/draw`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (response.ok) {
        console.log("Updated backend state:", result);
        console.log("Updated draw pile:", result.draw);
        console.log("Updated discard pile:", result.discard);

        // Update the frontend state with the backend response
        setState(result);
        setLastValidState(result);

        // Decrement moves left
        setMovesLeft((prevMovesLeft) => {
          const newMovesLeft = prevMovesLeft - 1;
          if (newMovesLeft <= 0 && !result.won) {
            setGameResult("lost");
            setIsGameOver(true);
          }
          return newMovesLeft;
        });

        // Check if the game is won
        if (result.won) {
          setGameResult("won");
          setIsGameOver(true);
        } else {
          checkGameOver();
        }
      } else {
        console.error("Failed to draw from stock:", result.error);
        setState(lastValidState); // Revert to the last valid state if the draw failed
        setErrorMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("Draw error:", error);
      setState(lastValidState); // Revert to the last valid state if there was an error
      setErrorMessage("Error during draw.");
    }
  };

  const handleDragStart = (card, pile, index) => {
    if (isGameOver || isAutocompleting) return;
    if (card.up) {
      let cardsToMove;
      if (pile === "discard") {
        cardsToMove = [card];
      } else {
        cardsToMove = state[pile].slice(index);
      }
      setSelected({ cards: cardsToMove, source: pile });
      setDragSource(pile);
    }
  };

  const handleDrop = async (targetPile) => {
    if (isGameOver || isAutocompleting) return;
    if (selected && dragSource) {
      const move = {
        cards: selected.cards,
        src: dragSource,
        dst: targetPile,
      };
      sendMoveRequest(move);
      setSelected(null);
      setDragSource(null);
    }
  };

  const sendMoveRequest = async (move) => {
    if (isGameOver || isAutocompleting) return;
    try {
      const response = await fetch(`/v1/game/${gameID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(move),
      });
      const result = await response.json();

      if (response.ok) {
        setState(result);
        setLastValidState(result);
        setMovesLeft((prevMovesLeft) => {
          const newMovesLeft = prevMovesLeft - 1;
          if (newMovesLeft <= 0 && !result.won) {
            setGameResult("lost");
            setIsGameOver(true);
          }
          return newMovesLeft;
        });
        if (result.won) {
          setGameResult("won");
          setIsGameOver(true);
        } else {
          checkGameOver();
        }
      } else {
        console.error("Invalid move:", result.error);
        setState(lastValidState);
        setErrorMessage(`Invalid move: ${result.error}`);
      }
    } catch (error) {
      console.error("Move validation error:", error);
      setState(lastValidState);
      setErrorMessage("Error validating move.");
    }
  };

  const handleAutocomplete = async () => {
    if (isGameOver || isAutocompleting) return;
    setIsAutocompleting(true);
    try {
      const response = await fetch(`/v1/game/${gameID}/autocomplete`, {
        method: "POST",
      });
      if (response.ok) {
        const updatedState = await response.json();
        setState(updatedState);
        setLastValidState(updatedState);
        if (updatedState.won) {
          setGameResult("won");
          setIsGameOver(true);
        } else {
          checkGameOver();
        }
      } else {
        const errorResult = await response.json();
        console.error("Autocomplete failed:", errorResult.error);
        setErrorMessage(`Autocomplete failed: ${errorResult.error}`);
      }
    } catch (error) {
      console.error("Error during autocomplete:", error);
      setErrorMessage("Error during autocomplete.");
    } finally {
      setIsAutocompleting(false);
    }
  };

  const handleUndo = async () => {
    if (isAutocompleting) return;
    try {
      const response = await fetch(`/v1/game/${gameID}/undo`, {
        method: "POST",
      });
      if (response.ok) {
        const updatedState = await response.json();
        setState(updatedState);
        setLastValidState(updatedState);
        if (updatedState.won) {
          setGameResult("won");
          setIsGameOver(true);
        } else {
          setIsGameOver(false);
          setGameResult(null);
          checkGameOver();
        }
      } else {
        const errorResult = await response.json();
        console.error("Undo failed:", errorResult.error);
        setErrorMessage(`Undo failed: ${errorResult.error}`);
      }
    } catch (error) {
      console.error("Error during undo:", error);
      setErrorMessage("Error during undo.");
    }
  };

  const handleRedo = async () => {
    if (isAutocompleting) return;
    try {
      const response = await fetch(`/v1/game/${gameID}/redo`, {
        method: "POST",
      });
      if (response.ok) {
        const updatedState = await response.json();
        setState(updatedState);
        setLastValidState(updatedState);
        if (updatedState.won) {
          setGameResult("won");
          setIsGameOver(true);
        } else {
          setIsGameOver(false);
          setGameResult(null);
          checkGameOver();
        }
      } else {
        const errorResult = await response.json();
        console.error("Redo failed:", errorResult.error);
        setErrorMessage(`Redo failed: ${errorResult.error}`);
      }
    } catch (error) {
      console.error("Error during redo:", error);
      setErrorMessage("Error during redo.");
    }
  };

  const resetSelection = (ev) => {
    if (ev.target === ev.currentTarget) setSelected(null);
  };

  const checkGameOver = async () => {
    if (isGameOver) return;
    try {
      const response = await fetch(`/v1/game/${gameID}/checkGameOver`);
      if (response.ok) {
        const data = await response.json();
        if (data.gameOver) {
          setGameResult("lost");
          setIsGameOver(true);
        }
      } else {
        const errorResult = await response.json();
        console.error("Failed to check game over:", errorResult.error);
        setErrorMessage(`Error: ${errorResult.error}`);
      }
    } catch (error) {
      console.error("Error checking game over:", error);
      setErrorMessage("Error checking game over.");
    }
  };

  const handleResultsNavigation = () => {
    navigate(`/results/${gameID}`);
  };

  const handleCloseError = () => {
    setErrorMessage(null);
  };

  if (!state) {
    return <div>Loading...</div>;
  }

  return (
    <GameContainer onClick={resetSelection}>
      <GameBase>
        <MovesLeftText>Moves Left: {movesLeft}</MovesLeftText>

        <div style={{ display: "flex", justifyContent: "center", margin: "10px" }}>
          <ActionButton onClick={handleAutocomplete} disabled={isAutocompleting}>
            {isAutocompleting ? "Autocompleting..." : "Autocomplete"}
          </ActionButton>
          <ActionButton onClick={handleUndo} disabled={isAutocompleting}>
            Undo
          </ActionButton>
          <ActionButton onClick={handleRedo} disabled={isAutocompleting}>
            Redo
          </ActionButton>
        </div>
        <CardRow>
          <Pile
            cards={state.stack1}
            spacing={0}
            onClick={(card, i) => handleCardClick(card, "stack1", i)}
            onDragStart={(card, i) => handleDragStart(card, "stack1", i)}
            onDrop={() => handleDrop("stack1")}
            selectedCards={selected}
            size="small"
          />
          <Pile
            cards={state.stack2}
            spacing={0}
            onClick={(card, i) => handleCardClick(card, "stack2", i)}
            onDragStart={(card, i) => handleDragStart(card, "stack2", i)}
            onDrop={() => handleDrop("stack2")}
            selectedCards={selected}
            size="small"
          />
          <Pile
            cards={state.stack3}
            spacing={0}
            onClick={(card, i) => handleCardClick(card, "stack3", i)}
            onDragStart={(card, i) => handleDragStart(card, "stack3", i)}
            onDrop={() => handleDrop("stack3")}
            selectedCards={selected}
            size="small"
          />
          <Pile
            cards={state.stack4}
            spacing={0}
            onClick={(card, i) => handleCardClick(card, "stack4", i)}
            onDragStart={(card, i) => handleDragStart(card, "stack4", i)}
            onDrop={() => handleDrop("stack4")}
            selectedCards={selected}
            size="small"
          />
          <CardRowGap />
          <Pile
            cards={state.draw}
            spacing={0}
            onClick={handleDrawFromStock}
            selectedCards={selected}
            size="small"
          />
          <Pile
            cards={state.discard}
            spacing={0}
            onClick={(card, i) => handleCardClick(card, "discard", i)}
            onDragStart={(card, i) => handleDragStart(card, "discard", i)}
            onDrop={() => handleDrop("discard")}
            selectedCards={selected}
            size="small"
          />
        </CardRow>
        <CardRow>
          {["pile1", "pile2", "pile3", "pile4", "pile5", "pile6", "pile7"].map(
            (pile, index) => (
              <Pile
                key={index}
                cards={state[pile]}
                onClick={(card, i) => handleCardClick(card, pile, i)}
                onDragStart={(card, i) => handleDragStart(card, pile, i)}
                onDrop={() => handleDrop(pile)}
                selectedCards={selected}
                size="small"
              />
            )
          )}
        </CardRow>
        <ResultsButton onClick={handleResultsNavigation}>View Results</ResultsButton>
      </GameBase>
      {gameResult && (
        <ModalOverlay>
          <ModalContent>
            <h2>
              {gameResult === "won" ? "Congratulations, you won!" : "Game Over. You lost!"}
            </h2>
            <ResultsButton onClick={handleResultsNavigation}>View Results</ResultsButton>
          </ModalContent>
        </ModalOverlay>
      )}
      {errorMessage && (
        <SmallModalOverlay onClick={handleCloseError}>
          <SmallModalContent>
            <p>{errorMessage}</p>
            <CloseButton onClick={handleCloseError}>Close</CloseButton>
          </SmallModalContent>
        </SmallModalOverlay>
      )}

    </GameContainer>
  );
};
