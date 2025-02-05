/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import md5 from "md5";

// Gravatar URL generator
export function GravHash(email, size) {
  let hash = email && email.trim().toLowerCase();
  hash = hash && md5(hash);
  return `https://www.gravatar.com/avatar/${hash}?size=${size}`;
}

// Theme colors for the header
const themeColors = {
  accent: "#ffcc00", // Yellow
  text: "#ffffff",   // White
  hover: "#00ffff",  // Cyan
};

// Keyframes for smooth card flipping
const rotateCard = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(180deg);
  }
`;

// Header Base Style
const HeaderBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: fixed;
  top: 20px;
  width: 100%;
  height: 70px;
  padding: 0 2rem; 
  z-index: 10;
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding: 0 1rem;
    height: 60px;
  }
`;

// Header Left Section
const HeaderLeftBase = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  & > a {
    text-decoration: none;

    & > h2 {
      color: ${themeColors.accent};
      font-size: 2.4rem;
      font-family: "Roboto Mono", monospace;
      font-weight: bold;
      margin: 0;
      text-shadow: 0 0 8px ${themeColors.accent};
    }

    &:hover > h2 {
      color: ${themeColors.hover};
      text-shadow: 0 0 12px ${themeColors.hover};
    }
  }
      /* Responsive adjustments */
  @media (max-width: 768px) {
    & > a > h2 {
      font-size: 2rem; 
    }
  }

  @media (max-width: 480px) {
    & > a > h2 {
      font-size: 1.5rem; 
    }
  }
`;


const CardContainer = styled.div`
  width: 50px;
  height: 70px;
  perspective: 1000px;

  @media (max-width: 768px) {
    width: 40px; 
    height: 60px;
  }

  @media (max-width: 480px) {
    width: 30px;
    height: 50px;
  }
`;

const RotatingCard = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d; 
  animation: ${rotateCard} 2s infinite linear;

  & > .front,
  & > .back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 8px;
    background-size: cover;
    background-position: center;
    box-shadow: 0 0 10px ${themeColors.accent};
  }

  & > .front {
    background-image: url("/images/king_of_hearts2.png"); 
    transform: rotateY(180deg);
  }

  & > .back {
    background-image: url("/images/face_down.jpg"); 
    transform: rotateY(0deg);
  }
`;

const HeaderLeft = ({ user }) => (
  <HeaderLeftBase>
    <Link to="/">
      <h2>Solitaire</h2>
    </Link>
    <CardContainer>
      <RotatingCard>
        <div className="front"></div>
        <div className="back"></div>
      </RotatingCard>
    </CardContainer>
  </HeaderLeftBase>
);

HeaderLeft.propTypes = {
  user: PropTypes.string,
};

// Header Right Section
const HeaderRightBase = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end; 
  gap: 1.5rem;
  padding-right: 1rem; 

  & > a {
    color: ${themeColors.hover};
    text-decoration: none;
    font-size: 1.2rem;
    font-weight: bold;
    font-family: "Roboto Mono", monospace;
    transition: color 0.3s ease, text-shadow 0.3s ease;

    &:hover {
      color: ${themeColors.accent};
      text-shadow: 0 0 10px ${themeColors.accent};
    }
  }

  & > img {
    width: 50px; 
    height: 50px;
    border-radius: 50%; 
    border: 3px solid ${themeColors.accent};
    box-shadow: 0 0 10px ${themeColors.accent}, 0 0 20px ${themeColors.hover}; 
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease;

    &:hover {
      border-color: ${themeColors.hover}; 
      box-shadow: 0 0 15px ${themeColors.hover}, 0 0 25px ${themeColors.text}; 
      transform: scale(1.1); 
    }
  }
    @media (max-width: 768px) {
      gap: 1rem;
      padding-right: 0.5rem;
  }

  & > a {
    @media (max-width: 768px) {
      font-size: 1rem; 
    }
  }

  & > img {
    @media (max-width: 768px) {
      width: 40px;
      height: 40px;
    }
  }
`;

const HeaderRight = ({ user, email }) => {
  const isLoggedIn = user !== "";
  return (
    <HeaderRightBase>
      {isLoggedIn ? (
        <Fragment>
          <Link to="/logout">Log Out</Link>
          <Link to={`/profile/${user}`}>
            <img src={GravHash(email, 40)} alt={`${user}'s avatar`} />
          </Link>
        </Fragment>
      ) : (
        <Fragment>
          <Link id="loginLink" to="/login">
            Log In
          </Link>
          <Link id="regLink" to="/register">
            Register
          </Link>
        </Fragment>
      )}
    </HeaderRightBase>
  );
};

HeaderRight.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string,
};

// Complete Header Component
export const Header = ({ user = "", email = "" }) => (
  <HeaderBase>
    <HeaderLeft user={user} />
    <HeaderRight user={user} email={email} />
  </HeaderBase>
);

Header.propTypes = {
  user: PropTypes.string,
  email: PropTypes.string,
};

export default Header;
