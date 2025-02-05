/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Link, useParams, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { GravHash } from "./header.js";

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
  justify-content: flex-start;
  animation: ${gradientAnimation} 8s infinite;
  padding: 7em 1em; 
  color: #f7ff00;

  @media (max-width: 768px) {
    padding: 0.8em;
  }

  @media (max-width: 480px) {
    padding: 0.5em;
  }
`;


// Section wrapper
const SectionWrapper = styled.div`
  width: 90%;
  max-width: 1000px;
  margin: 1em auto;
  padding: 1em;
  background-color: rgba(28, 28, 28, 0.9);
  border-radius: 12px;
  border: 2px solid ${({ borderColor }) => borderColor};
  box-shadow: 0 0 15px ${({ borderColor }) => borderColor};

  @media (max-width: 768px) {
    padding: 0.8em;
  }

  @media (max-width: 480px) {
    padding: 0.5em;
  }
`;

// Profile section
const ProfileSection = styled(SectionWrapper)`
  text-align: center;
  border-color: #005eff;
  margin-top: 7em;
  @media (max-width: 480px) {
    font-size: 0.9em; 
  }
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  margin-bottom: 1em;
  box-shadow: 0 0 10px #005eff;
  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
  }

  @media (max-width: 480px) {
    width: 80px;
    height: 80px;
  }
`;

const InfoText = styled.p`
  margin: 0.5em 0;
  font-size: 1.2em;
  font-family: "Orbitron", sans-serif;
  color: #f7ff00;
  text-shadow: 0 0 8px #f7ff00, 0 0 15px #005eff;
  @media (max-width: 768px) {
    font-size: 1em;
  }

  @media (max-width: 480px) {
    font-size: 0.9em;
  }
`;

const EditButton = styled(Link)`
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
  @media (max-width: 768px) {
    padding: 0.6em 1em;
    font-size: 0.9em;
  }

  @media (max-width: 480px) {
    padding: 0.5em 0.8em;
    font-size: 0.8em;
  }
`;

// Games section
const GamesSection = styled(SectionWrapper)`
  border-color: #9d00ff;
  max-height: 500px;
  overflow-y: scroll;
  @media (max-width: 768px) {
    max-height: 400px;
  }

  @media (max-width: 480px) {
    max-height: 300px; 
    padding: 0.5em;
  }
  ::-webkit-scrollbar {
    width: 12px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(90deg, #005eff, #9d00ff);
    border-radius: 6px;
    border: 2px solid #1c1c1c;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(90deg, #9d00ff, #f7ff00);
  }

  ::-webkit-scrollbar-track {
    background: #1c1c1c;
    border-radius: 6px;
  }

  scrollbar-color: linear-gradient(90deg, #005eff, #9d00ff) #1c1c1c;
  scrollbar-width: thin;
`;

const StartGameButton = styled.button`
  display: block;
  margin: 1em auto;
  padding: 0.6em 1.2em;
  font-size: 1em;
  font-family: "Orbitron", sans-serif;
  font-weight: bold;
  color: #fff;
  background-color: #005eff;
  border: none;
  border-radius: 8px;
  box-shadow: 0 0 10px #005eff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #9d00ff;
    box-shadow: 0 0 15px #9d00ff;
  }
  @media (max-width: 768px) {
    padding: 0.5em 1em;
    font-size: 0.9em;
  }

  @media (max-width: 480px) {
    padding: 0.4em 0.8em;
    font-size: 0.8em;
  }
`;

// Styled games table
const GamesTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 0.8em;
    text-align: center;
    font-size: 1em;
    font-family: "Roboto Mono", monospace;
    color: #f7ff00;
    border-bottom: 1px solid #555;
  }
  @media (max-width: 768px) {
      font-size: 0.9em;
      padding: 0.6em;
    }

  @media (max-width: 480px) {
      font-size: 0.8em;
      padding: 0.4em;
    }
  }

  th {
    background-color: #1c1c1c;
    color: #00ffff;
  }

  tr:hover {
    background-color: rgba(0, 94, 255, 0.2);
  }
  @media (max-width: 768px) {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }
`;

const ActionButton = styled.button`
  padding: 0.5em 1em;
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
`;

// Main Profile Component
export const Profile = ({ currentUser }) => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({
    username: "",
    first_name: "",
    last_name: "",
    primary_email: "",
    city: "",
    games: [],
    error: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/v1/user/${username}`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch user data.");
        const data = await res.json();
        setState({
          username: data.username,
          first_name: data.first_name || "Unknown",
          last_name: data.last_name || "Unknown",
          primary_email: data.primary_email || "Unknown",
          city: data.city || "Unknown",
          games: data.games || [],
          error: "",
        });
      } catch (error) {
        console.error(error);
        setState((prev) => ({ ...prev, error: "Unable to fetch user data." }));
      }
    };
    fetchUser();
  }, [username]);

  const startNewGame = () => {
    navigate("/start");
  };

  return (
    <MainContainer>
      {/* Profile Section */}
      <ProfileSection>
        <ProfileImage src={GravHash(state.primary_email, 200)} alt="Profile Avatar" />
        <InfoText><strong>Username:</strong> {state.username}</InfoText>
        <InfoText><strong>First Name:</strong> {state.first_name}</InfoText>
        <InfoText><strong>Last Name:</strong> {state.last_name}</InfoText>
        <InfoText><strong>City:</strong> {state.city}</InfoText>
        <InfoText><strong>Email Address:</strong> {state.primary_email}</InfoText>
        <EditButton to={`/edit/${state.username}`}>Edit Profile</EditButton>
      </ProfileSection>

      {/* Games Section */}
      <GamesSection>
        <h2>Games ({state.games.length}):</h2>
        <StartGameButton onClick={startNewGame}>Start New Game</StartGameButton>
        <GamesTable>
          <thead>
            <tr>
              <th>Status</th>
              <th>Start Date</th>
              <th># of Moves</th>
              <th>Score</th>
              <th>Game Type</th>
            </tr>
          </thead>
          <tbody>
            {state.games.map((game, index) => (
              <tr key={index}>
                <td>
                  <ActionButton>
                    <Link to={`/game/${game.id}`} style={{ color: "#fff", textDecoration: "none" }}>
                      {game.active ? "Active" : "Complete"}
                    </Link>
                  </ActionButton>
                </td>
                <td>{game.start ? new Date(game.start).toLocaleString() : "Invalid Date"}</td>
                <td>{game.moves || 0}</td>
                <td>{game.score || 0}</td>
                <td>{game.game || "Unknown"}</td>
              </tr>
            ))}
          </tbody>


        </GamesTable>
      </GamesSection>
    </MainContainer>
  );
};

Profile.propTypes = {
  currentUser: PropTypes.string.isRequired,
};
