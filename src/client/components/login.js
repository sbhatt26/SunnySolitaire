/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";

// Background gradient animation
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Main container for the login form
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: ${gradientAnimation} 10s infinite;
  padding: 1em;
  color: #f7ff00;
  @media (max-width: 768px) {
    padding: 2em; 
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
  @media (max-width: 768px) {
    padding: 1.5em;
    max-width: 300px;
  }

  @media (max-width: 480px) {
    padding: 1em;
    max-width: 90%; 
  }
`;

// Form Header with neon glow
const FormHeader = styled.h2`
  font-size: 1.8em;
  font-family: "Orbitron", sans-serif;
  color: #f7ff00;
  text-shadow: 0 0 8px #f7ff00, 0 0 15px #005eff;
  margin-bottom: 1em;
  @media (max-width: 768px) {
    font-size: 1.5em; 
  }

  @media (max-width: 480px) {
    font-size: 1.2em; 
  }
`;


const FormLabel = styled.label`
  font-size: 1.2em;
  color: #00ffff;
  margin-bottom: 0.5em;
  display: block;
  font-family: "Roboto Mono", monospace;
`;

const FormInput = styled.input`
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

 
  &::placeholder {
    color: rgba(255, 255, 255, 0.5); 
    font-family: "Orbitron", sans-serif;
    font-weight: normal; 
    font-style: normal;
  }
  @media (max-width: 768px) {
    font-size: 0.9em; 
    padding: 0.7em;
  }

  @media (max-width: 480px) {
    font-size: 0.8em; 
    padding: 0.6em; 
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
    padding: 0.7em; 
  }

  @media (max-width: 480px) {
    font-size: 0.9em; 
    padding: 0.6em; 
  }
`;

// Error message
const ErrorMessage = styled.div`
  color: #ff0033;
  background: #440000;
  padding: 0.5em;
  margin-bottom: 1em;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
`;

export const Login = ({ logIn }) => {
  const navigate = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [error, setError] = useState("");

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setError(""); // Clear previous errors
    try {
      const res = await fetch("/v1/session", {
        body: JSON.stringify({
          username,
          password,
        }),
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });
      const data = await res.json();
      if (res.ok) {
        logIn(data.username);
        navigate(`/profile/${data.username}`);
      } else {
        setError(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Error: Unable to login. Please try again.");
    }
  };

  const handleGitHubLogin = () => {
    window.location.href = "/v1/auth/github"; // Redirect to GitHub OAuth
  };

  const handleRegisterRedirect = () => {
    navigate("/register"); // Redirect to the register page
  };

  useEffect(() => {
    const usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.focus();
  }, []);

  return (
    <MainContainer>
      <FormContainer>
        <FormHeader>Login</FormHeader>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <form onSubmit={onSubmit}>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput
            id="username"
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(ev) => setUser(ev.target.value.toLowerCase())}
            required
          />
          <FormLabel htmlFor="password">Password:</FormLabel>
          <FormInput
            id="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(ev) => setPass(ev.target.value)}
            required
          />
          <FormButton type="submit">Login</FormButton>
          <FormButton type="button" onClick={handleGitHubLogin}>
            Login with GitHub
          </FormButton>
          <FormButton type="button" onClick={handleRegisterRedirect}>
            Not Registered? Create an Account
          </FormButton>
        </form>
      </FormContainer>
    </MainContainer>
  );
};

Login.propTypes = {
  logIn: PropTypes.func.isRequired,
};
