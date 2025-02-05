/* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";

// Gradient animation for background
const gradientAnimation = keyframes`
  0% { background: #0d0d0d; }
  50% { background: #1a1a40; }
  100% { background: #0d0d0d; }
`;

// Typing animation for the list
const typing = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const blink = keyframes`
  50% { border-color: transparent; }
`;

// Keyframes for card animation
const distributeCards = keyframes`
  0% {
    transform: translate(0, 150px) rotate(0deg);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--x), var(--y)) rotate(var(--rotation));
    opacity: 1;
  }
`;

// Styled components
const LandingBase = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  animation: ${gradientAnimation} 10s infinite;
  font-family: 'Roboto Mono', monospace;
  height: 100vh;
  position: relative;
  overflow: hidden;
  color: #f7ff00;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.7);
  z-index: 1;
`;

const HeroContent = styled.div`
  position: absolute;
  z-index: 3; 
  text-align: center;
  color: #f7ff00;
  top: 75%; 
  left: 50%;
  transform: translate(-50%, -50%);
  animation: fadeIn 2s ease-in-out;

  @media (max-width: 768px) {
    top: 70%; 
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-family: "Orbitron", sans-serif;
  font-weight: 700;
  margin-bottom: 20px;
  text-shadow: 0 0 8px #f7ff00, 0 0 15px #005eff;
  @media (max-width: 768px) {
    font-size: 2rem; 
  }
`;

const Subtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 30px;
  font-family: "Roboto Mono", monospace;
  color: #00ffff;
  text-shadow: 0 0 8px #00ffff, 0 0 10px #9d00ff;
  @media (max-width: 768px) {
    font-size: 1rem; 
  }
`;

const TypingContainer = styled.div`
  display: flex;
  flex-direction: column;
  text-align: left;
  color: #00ffff;
  font-size: 1rem;
  font-family: "Roboto Mono", monospace;
  margin-top: 30px; 
  width: 60%;
  border-right: 2px solid #00ffff;
  white-space: nowrap;
  overflow: hidden;
  animation: ${typing} 6s steps(40, end), ${blink} 0.5s step-end infinite;

  @media (max-width: 768px) {
    font-size: 0.8rem;
    width: 100%;
  }
`;

const Button = styled.a`
  background-color: #f7ff00;
  color: #000;
  padding: 12px 25px;
  font-size: 1.2rem;
  font-weight: 600;
  border-radius: 30px;
  text-decoration: none;
  transition: background-color 0.3s, transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 0 15px #f7ff00;

  &:hover {
    background-color: #00ffff;
    transform: translateY(-5px);
    box-shadow: 0 0 20px #00ffff;
  }
  @media (max-width: 768px) {
    padding: 10px 20px; 
    font-size: 1rem;
  }
`;

const CardContainer = styled.div`
  position: absolute;
  top: 40%; 
  left: 50%;
  bottom: 30%;
  transform: translate(-50%, -50%);
  z-index: 2;
  overflow: visible; /* Prevent clipping */
  pointer-events: none;

  @media (max-width: 768px) {
    top: 35%; 
  }
`;
const Card = styled.div`
  position: absolute;
  width: 100px; 
  height: 150px;
  background-size: 100% 100%; 
  background-position: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2), 0 0 10px #9d00ff;
  animation: ${distributeCards} 5s forwards;
  overflow: visible;

  &:hover {
    box-shadow: 0 0 20px #00ffff, 0 0 15px #f7ff00;
  }
  @media (max-width: 768px) {
    width: 70px; /* Smaller card size for smaller screens */
    height: 120px;
  }
`;

const Landing = () => {
  const cardImages = [
    '/images/ace_of_spades.png',
    '/images/king_of_diamonds2.png',
    '/images/queen_of_hearts2.png',
    '/images/jack_of_clubs2.png',
    '/images/2_of_spades.png',
    '/images/ace_of_diamonds.png',
    '/images/3_of_hearts.png',
    '/images/4_of_clubs.png',
    '/images/5_of_spades.png',
  ];

  const [cards, setCards] = useState([]);
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    const boundaryRadius = 300;
    const minY = -100;
    const maxY = 100;

    const generateCardStyles = () => {
      return cardImages.map(() => {
        let angle, radian, distance, x, y;
        do {
          angle = Math.random() * 360;
          radian = angle * (Math.PI / 180);
          distance = Math.random() * boundaryRadius;
          x = Math.cos(radian) * distance;
          y = Math.sin(radian) * distance;
        } while (y < minY || y > maxY);

        const rotation = `${Math.random() * 60 - 30}deg`;
        return { x: `${x}px`, y: `${y}px`, rotation };
      });
    };

    const shuffleCards = () => {
      setCards(generateCardStyles());
      setAnimationKey((prev) => prev + 1);
    };

    shuffleCards();
    const interval = setInterval(shuffleCards, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <LandingBase>
      <Overlay />
      <CardContainer>
        {cards.map((style, index) => (
          <Card
            key={`${index}-${animationKey}`}
            style={{
              backgroundImage: `url(${cardImages[index % cardImages.length]})`,
              "--x": style.x,
              "--y": style.y,
              "--rotation": style.rotation,
            }}
          />
        ))}
      </CardContainer>
      <HeroContent>
        <Title>Welcome to GrahamCard</Title>
        <Subtitle>Your Gateway to a World of Gaming Possibilities</Subtitle>

        <Button href="/register">Get Started</Button>
        <TypingContainer>
          • Modify and save user profiles<br />
          • Fully functional results page<br />
          • Clickable moves with rendering<br />
          • GitHub OAuth for authentication<br />
          • Autocomplete valid moves<br />
          • End-of-game detection<br />
          • Infinite undo/redo feature
        </TypingContainer>
      </HeroContent>
    </LandingBase>
  );
};

export default Landing;
