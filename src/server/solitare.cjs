// /* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const shuffleCards = (includeJokers = false) => {
  let cards = [];
  ["spades", "clubs", "hearts", "diamonds"].forEach((suit) => {
    ["ace", 2, 3, 4, 5, 6, 7, 8, 9, 10, "jack", "queen", "king"].forEach((value) => {
      cards.push({ suit: suit, value: value, up: false });
    });
  });
  let deck = [];
  while (cards.length > 0) {
    const index = Math.floor(Math.random() * cards.length);
    deck.push(cards.splice(index, 1)[0]);
  }
  return deck;
};

const initialState = () => {
  let state = {
    pile1: [],
    pile2: [],
    pile3: [],
    pile4: [],
    pile5: [],
    pile6: [],
    pile7: [],
    stack1: [],
    stack2: [],
    stack3: [],
    stack4: [],
    draw: [],
    discard: [],
    score: 0,
  };

  const deck = shuffleCards(false);

  for (let i = 1; i <= 7; i++) {
    for (let j = 1; j <= i; j++) {
      const card = deck.shift();
      card.up = j === i;
      state[`pile${i}`].push(card);
    }
  }

  state.draw = deck;

  return state;
};

const getCardValue = (card) => {
  if (card.value === "ace") return 1;
  if (card.value === "jack") return 11;
  if (card.value === "queen") return 12;
  if (card.value === "king") return 13;
  return parseInt(card.value, 10);
};

const isAlternatingColor = (card1, card2) => {
  const redSuits = ["hearts", "diamonds"];
  const blackSuits = ["spades", "clubs"];
  return (
    (redSuits.includes(card1.suit) && blackSuits.includes(card2.suit)) ||
    (blackSuits.includes(card1.suit) && redSuits.includes(card2.suit))
  );
};

const validateMove = (currentState, requestedMove) => {
  const { src, dst, cards } = requestedMove;
  let scoreIncrement = 0;

  if (!currentState[src] || !currentState[dst]) {
    return { error: "Invalid source or destination pile" };
  }

  const sourcePile = currentState[src];
  const destPile = currentState[dst];
  const sourceCards = sourcePile.slice(-cards.length);

  // Ensure cards are face-up
  if (!cards.every((card) => card.up)) {
    return { error: "Cannot move face-down cards" };
  }

  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const sourceCard = sourceCards[i];
    if (
      card.suit !== sourceCard.suit ||
      card.value !== sourceCard.value ||
      card.up !== sourceCard.up
    ) {
      return { error: "Invalid cards to move" };
    }
  }

  // Moving from 'discard' pile
  if (src === "discard") {
    // Only one card can be moved from discard pile
    if (cards.length !== 1) {
      return { error: "Can only move one card from discard pile" };
    }
  }

  // Moving to a foundation pile (stack1 to stack4)
  if (dst.startsWith("stack")) {
    // Only one card can be moved at a time to the foundation
    if (cards.length !== 1) {
      return { error: "Can only move one card to foundation at a time" };
    }
    const card = cards[0];
    const destTopCard = destPile[destPile.length - 1];
    if (!destTopCard) {
      if (getCardValue(card) !== 1) {
        return { error: "Only Ace can be placed on empty foundation pile" };
      }
    } else {
      if (card.suit !== destTopCard.suit) {
        return { error: "Card must be of the same suit as foundation pile" };
      }
      if (getCardValue(card) !== getCardValue(destTopCard) + 1) {
        return {
          error: "Card must be one higher in value than foundation top card",
        };
      }
    }
    // Award points for moving to foundation
    scoreIncrement += 10;
  }
  // Moving to a tableau pile (pile1 to pile7)
  else if (dst.startsWith("pile")) {
    const movingCards = cards;
    const card = movingCards[0];
    const destTopCard = destPile[destPile.length - 1];
    if (!destTopCard) {
      if (getCardValue(card) !== 13) {
        return { error: "Only King can be placed on empty tableau pile" };
      }
    } else {
      if (!isAlternatingColor(card, destTopCard)) {
        return { error: "Card must be of opposite color" };
      }
      if (getCardValue(card) !== getCardValue(destTopCard) - 1) {
        return {
          error: "Card must be one lower in value than destination top card",
        };
      }
    }
    // Award points for moving from waste to tableau
    if (src === "discard") {
      scoreIncrement += 5;
    }
  } else {
    return { error: "Invalid destination pile" };
  }

  // All validations passed, update the state
  const newState = JSON.parse(JSON.stringify(currentState));
  newState[src].splice(-cards.length, cards.length);
  newState[dst].push(...cards);

  // If source pile is tableau and now has a face-down card on top, flip it
  if (src.startsWith("pile") && newState[src].length > 0) {
    const topCard = newState[src][newState[src].length - 1];
    if (!topCard.up) {
      topCard.up = true;
      scoreIncrement += 5; // Points for turning over a tableau card
    }
  }

  // Update the score in the new state
  newState.score = (currentState.score || 0) + scoreIncrement;

  return { newState };
};

// Remove 'state' from this function to prevent overwriting
const filterGameForProfile = (game) => ({
  active: game.active,
  score: game.score,
  won: game.won,
  id: game._id,
  game: "klondike",
  start: game.start,
  moves: game.moves,
  winner: game.winner,
});

const filterMoveForResults = (move) => ({ ...move.toJSON() });

module.exports = {
  shuffleCards,
  initialState,
  filterGameForProfile,
  filterMoveForResults,
  validateMove,
  getCardValue,
};
