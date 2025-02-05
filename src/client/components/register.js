/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { validPassword, validUsername } from "../../shared/index.js";

// Gradient animation for background
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Main Container for the form
const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  animation: ${gradientAnimation} 10s infinite;
  padding: 1em;
  padding-top: 10em;
  color: #f7ff00;
  @media (max-width: 768px) {
    padding: 6em; 
  }

  @media (max-width: 480px) {
    padding: 7em; 
  }
  @media (min-width: 1024px) {
    padding-top: 8em;
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
    max-width: 350px; 
  }

  @media (max-width: 480px) {
    padding: 1em; 
    max-width: 300px; 
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

// Label with cyberpunk style
const FormLabel = styled.label`
  font-size: 1.2em;
  color: #00ffff;
  margin-bottom: 0.5em;
  display: block;
  font-family: "Roboto Mono", monospace;
  @media (max-width: 768px) {
    font-size: 1em;
  }

  @media (max-width: 480px) {
    font-size: 0.9em;
  }
`;

// Input field with glowing border and cyberpunk text style
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

  /* Placeholder styling */
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

// Notification Modal
const NotificationModal = styled.div`
  position: fixed;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -20%);
  padding: 2em;
  background-color: #1c1c1c;
  color: #f7ff00;
  border-radius: 12px;
  box-shadow: 0 0 20px #005eff;
  z-index: 1000;
  text-align: center;
  @media (max-width: 768px) {
    padding: 1.5em; 
  }

  @media (max-width: 480px) {
    padding: 1em; 
    width: 90%; 
  }
`;

export const Register = () => {
  const navigate = useNavigate();
  const [state, setState] = useState({
    username: "",
    first_name: "",
    last_name: "",
    city: "",
    primary_email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [notify, setNotify] = useState("");

  useEffect(() => {
    const usernameInput = document.getElementById("username");
    if (usernameInput) usernameInput.focus();
  }, []);

  const onChange = (ev) => {
    setError("");
    setState({
      ...state,
      [ev.target.name]: ev.target.value,
    });

    if (ev.target.name === "username") {
      let usernameInvalid = validUsername(ev.target.value);
      if (usernameInvalid) setError(`Error: ${usernameInvalid.error}`);
    } else if (ev.target.name === "password") {
      let pwdInvalid = validPassword(ev.target.value);
      if (pwdInvalid) setError(`Error: ${pwdInvalid.error}`);
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (error !== "") return;
    try {
      const res = await fetch("/v1/user", {
        method: "POST",
        body: JSON.stringify(state),
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
      });
      if (res.ok) {
        setNotify(`${state.username} registered. You will now need to log in.`);
      } else {
        const err = await res.json();
        setError(`Error: ${err.error}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Error: Unable to register. Please try again.");
    }
  };

  const onAcceptRegister = () => {
    navigate("/login");
  };

  const handleGitHubRegister = () => {
    window.location.href = "/v1/auth/github"; // Redirect to GitHub OAuth
  };

  const handleAlreadyRegistered = () => {
    navigate("/login"); // Redirect to login page
  };

  return (
    <MainContainer>
      {notify !== "" && (
        <NotificationModal>
          <p>{notify}</p>
          <FormButton onClick={onAcceptRegister}>OK</FormButton>
        </NotificationModal>
      )}
      <FormContainer>
        <FormHeader>Create a New Account</FormHeader>
        {error && <p style={{ color: "red", marginBottom: "1em" }}>{error}</p>}
        <form onSubmit={onSubmit}>
          <FormLabel htmlFor="username">Username:</FormLabel>
          <FormInput
            id="username"
            name="username"
            placeholder="Username"
            onChange={onChange}
            value={state.username}
            required
          />
          <FormLabel htmlFor="first_name">First Name:</FormLabel>
          <FormInput
            id="first_name"
            name="first_name"
            placeholder="First Name"
            onChange={onChange}
            value={state.first_name}
            required
          />
          <FormLabel htmlFor="last_name">Last Name:</FormLabel>
          <FormInput
            id="last_name"
            name="last_name"
            placeholder="Last Name"
            onChange={onChange}
            value={state.last_name}
            required
          />
          <FormLabel htmlFor="city">City:</FormLabel>
          <FormInput
            id="city"
            name="city"
            placeholder="City"
            onChange={onChange}
            value={state.city}
            required
          />
          <FormLabel htmlFor="primary_email">Email:</FormLabel>
          <FormInput
            id="primary_email"
            name="primary_email"
            type="email"
            placeholder="Email Address"
            onChange={onChange}
            value={state.primary_email}
            required
          />
          <FormLabel htmlFor="password">Password:</FormLabel>
          <FormInput
            id="password"
            name="password"
            type="password"
            placeholder="Password"
            onChange={onChange}
            value={state.password}
            required
          />
          <FormButton type="submit">Register</FormButton>
          <FormButton type="button" onClick={handleGitHubRegister}>
            Register with GitHub
          </FormButton>
          <FormButton type="button" onClick={handleAlreadyRegistered}>
            Already Registered? Login Here
          </FormButton>
        </form>
      </FormContainer>
    </MainContainer>
  );
};
