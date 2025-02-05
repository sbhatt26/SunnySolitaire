/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";

import { Header } from "./components/header.js";
import Landing from "./components/landing.js";
import { Login } from "./components/login.js";
import { Logout } from "./components/logout.js";
import { Register } from "./components/register.js";
import { Profile } from "./components/profile.js";
import Start from "./components/start.js";
import { Results } from "./components/results.js";
import { Game } from "./components/game.js";

import EditProfile from "./components/EditProfile.js";

// Default user object
const defaultUser = {
  username: "",
  first_name: "",
  last_name: "",
  primary_email: "",
  city: "",
  games: [],
};

// Global styles to include fonts and body background
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&family=Montserrat:wght@700&display=swap');

  body {
    margin: 0;
    background-color: #1a1a1a; 
    font-family: 'Roboto', sans-serif;
    color: #fff; 
  }
`;

const GridBase = styled.div`
  display: grid;
  grid-template-rows: 60px 1fr; 
  grid-template-areas:
    "hd"
    "main";
  height: 100vh; 
  width: 100vw;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
`;

// Component to require the user to be logged in
const ReqUser = ({ user, children }) =>
  !user || user.username === "" ? <Navigate to="/login" replace /> : children;

// Component to handle registration logic
const CheckRegister = ({ loggedIn, username }) =>
  loggedIn ? <Navigate to={`/profile/${username}`} replace /> : <Register />;

// Main Application Component
const MyApp = () => {
  const navigate = useNavigate();
  const [state, setState] = useState(defaultUser);

  // Fetch current session user data
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      setState(JSON.parse(data));
    } else {
      fetch(`/v1/session`, { credentials: "include" })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch session data");
          return res.json();
        })
        .then((userData) => {
          if (userData.username) {
            localStorage.setItem("user", JSON.stringify(userData));
            setState(userData);
          } else {
            localStorage.removeItem("user");
            setState(defaultUser);
          }
        })
        .catch((err) => {
          console.error("Error during session fetch:", err);
          localStorage.removeItem("user");
          setState(defaultUser);
        });
    }
  }, []);

  // Check if the user is logged in
  const loggedIn = () => state.username && state.primary_email;

  // Login helper function
  const logIn = async (username) => {
    try {
      const res = await fetch(`/v1/user/${username}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const user = await res.json();
      localStorage.setItem("user", JSON.stringify(user));
      setState(user);
      navigate(`/profile/${user.username}`);
    } catch (err) {
      console.error("Error during login:", err);
      alert("Login failed. Please try again.");
    }
  };

  // Logout helper function
  const logOut = async () => {
    try {
      const res = await fetch(`/v1/session`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok || res.status === 204) {
        localStorage.removeItem("user");
        setState(defaultUser);
        navigate("/login");
      } else {
        throw new Error("Failed to log out");
      }
    } catch (err) {
      console.error("Error during logout:", err);
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <>
      <GlobalStyle />
      <GridBase>
        <Header user={state.username} email={state.primary_email} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login logIn={logIn} />} />
          <Route path="/logout" element={<Logout logOut={logOut} />} />
          <Route
            path="/register"
            element={<CheckRegister loggedIn={loggedIn()} username={state.username} />}
          />
          <Route
            path="/profile/:username"
            element={<Profile currentUser={state.username} />}
          />
          <Route
            path="/edit/:username"
            element={
              <ReqUser user={state}>
                <EditProfile currentUser={state.username} />
              </ReqUser>
            }
          />
          <Route
            path="/start"
            element={
              <ReqUser user={state}>
                <Start />
              </ReqUser>
            }
          />
          <Route
            path="/game/:id"
            element={
              <ReqUser user={state}>
                <Game user={state} />
              </ReqUser>
            }
          />
          <Route
            path="/results/:id"
            element={
              <ReqUser user={state}>
                <Results user={state} />
              </ReqUser>
            }
          />
          {/* Redirect any unknown paths to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </GridBase>
    </>
  );
};

// Wrap MyApp with BrowserRouter
const AppWithRouter = () => (
  <BrowserRouter>
    <MyApp />
  </BrowserRouter>
);

// Render the app to the DOM
const root = createRoot(document.getElementById("mainDiv"));
root.render(<AppWithRouter />);
