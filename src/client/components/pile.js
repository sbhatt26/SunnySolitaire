// /* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

import React from "react";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";

// Styled Card Image with Conditional Styling
const CardImg = styled.img`
  position: absolute;
  height: auto;
  width: 100%;
  ${({ $isSelected }) =>
    $isSelected &&
    css`
      border: 2px solid yellow;
      border-radius: 5px;
    `}
`;

export const Card = ({ card, top, left, onClick, onDragStart, isSelected }) => {
  const source = card.up
    ? `/images/${card.value}_of_${card.suit}.png`
    : "/images/face_down.jpg";
  const style = { left: `${left}%`, top: `${top}%` };
  const id = `${card.suit}:${card.value}`;
  return (
    <CardImg
      id={id}
      draggable={card.up}
      onClick={() => onClick(card)}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", "");
        onDragStart(card);
      }}
      style={style}
      src={source}
      $isSelected={isSelected}
    />
  );
};


// Styled Pile Base
const PileBase = styled.div`
  margin: 5px;
  position: relative;
  display: inline-block;
  border: dashed 2px #808080;
  border-radius: 5px;
  width: 12%;
`;

// Styled Pile Frame
const PileFrame = styled.div`
  margin-top: 140%;
`;

// Pile Component
export const Pile = ({
  cards = [],
  spacing = 8,
  horizontal = false,
  onClick,
  onDragStart,
  onDrop,
  selectedCards,
}) => {
  const children = cards.map((card, i) => {
    const top = horizontal ? 0 : i * spacing;
    const left = horizontal ? i * spacing : 0;
    const isSelected =
      selectedCards &&
      selectedCards.cards.some(
        (selCard) =>
          selCard.suit === card.suit && selCard.value === card.value
      );
    return (
      <Card
        key={i}
        card={card}
        top={top}
        left={left}
        onClick={(clickedCard) => onClick(clickedCard, i)}
        onDragStart={(draggedCard) => onDragStart(draggedCard, i)}
        isSelected={isSelected} // Pass to the Card component
      />
    );
  });
  return (
    <PileBase onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
      <PileFrame>{children}</PileFrame>
    </PileBase>
  );
};

Pile.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  onClick: PropTypes.func,
  onDragStart: PropTypes.func,
  onDrop: PropTypes.func,
  horizontal: PropTypes.bool,
  spacing: PropTypes.number,
  selectedCards: PropTypes.object,
};
