// /* Copyright G. Hemingway, 2024 - All rights reserved */
"use strict";

const Joi = require("joi");
const {
  initialState,
  shuffleCards,
  filterGameForProfile,
  filterMoveForResults,
  validateMove,
  getCardValue,
} = require("../../solitare.cjs");
const Move = require("../../models/move.cjs");

module.exports = (app) => {
  // Helper function to get or initialize undo/redo stacks in session
  function getUndoRedoStacks(req, gameID) {
    if (!req.session.undoRedoStacks) {
      req.session.undoRedoStacks = {};
    }
    if (!req.session.undoRedoStacks[gameID]) {
      req.session.undoRedoStacks[gameID] = {
        undoStack: [],
        redoStack: [],
      };
    }
    return req.session.undoRedoStacks[gameID];
  }

  // Route to create a new game
  app.post("/v1/game", async (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: "Unauthorized" });

    const schema = Joi.object({
      game: Joi.string().lowercase().required(),
      color: Joi.string().lowercase().required(),
      draw: Joi.string().valid("Draw 1", "Draw 3").required(),
      type: Joi.string().valid("Klondike", "Spider", "FreeCell").default("Klondike"),
    });

    try {
      const data = await schema.validateAsync(req.body, { stripUnknown: true });
      const newGame = {
        owner: req.session.user._id,
        active: true,
        cards_remaining: 52,
        color: data.color,
        game: req.body.game,
        type: data.type,
        initialDeck: shuffleCards(false),
        score: 0,
        start: Date.now(),
        winner: "",
        state: initialState(),
        drawCount: data.draw === "Draw 3" ? 3 : 1,
        moves: 0,
        won: false,
      };

      const game = new app.models.Game(newGame);
      await game.save();
      await app.models.User.findByIdAndUpdate(req.session.user._id, {
        $push: { games: game._id },
      });

      // Initialize undo and redo stacks in session
      const { undoStack } = getUndoRedoStacks(req, game._id.toString());
      // Save the initial state onto the undo stack
      undoStack.push(JSON.parse(JSON.stringify(game.state.toJSON())));

      res.status(201).send({ id: game._id });
    } catch (err) {
      const message = err.details ? err.details[0].message : "Validation error";
      console.error(`Game.create validation failure: ${message}`);
      res.status(400).send({ error: message });
    }
  });

  app.get("/v1/game/:id", async (req, res) => {
    try {
      const game = await app.models.Game.findById(req.params.id);
      if (!game) return res.status(404).send({ error: `Unknown game: ${req.params.id}` });

      // Initialize undo/redo stacks in session
      const { undoStack } = getUndoRedoStacks(req, game._id.toString());

      // If undo stack is empty (e.g., after server restart), push current state
      if (undoStack.length === 0) {
        undoStack.push(JSON.parse(JSON.stringify(game.state.toJSON())));
      }

      const state = game.state.toJSON();
      const results = filterGameForProfile(game);

      results.start = Date.parse(results.start);
      results.cards_remaining =
        52 -
        (state.stack1.length +
          state.stack2.length +
          state.stack3.length +
          state.stack4.length);
      results.score = game.score;
      results.won = game.won;

      const moveIndex = req.query.moveIndex ? parseInt(req.query.moveIndex, 10) : null;

      if (moveIndex !== null && !isNaN(moveIndex)) {
        const moves = await app.models.Move.find({ game: req.params.id }).sort({ date: 1 });

        if (moveIndex >= 0 && moveIndex < moves.length) {
          const selectedMoveState = moves[moveIndex].state;
          return res.status(200).json({
            ...results,
            ...selectedMoveState,
            moves: moves.map((move) => ({
              ...filterMoveForResults(move),
              state: move.state,
            })),
          });
        } else {
          return res.status(400).send({ error: "Invalid move index" });
        }
      }

      if (req.query.moves !== undefined) {
        const moves = await app.models.Move.find({ game: req.params.id }).populate({
          path: "user",
          select: "name first_name last_name",
        });

        state.moves = moves.map((move) => ({
          ...filterMoveForResults(move),
          state: move.state,
        }));
      }

      res.status(200).json({ ...results, ...state });
    } catch (err) {
      console.error(`Error fetching game: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Route to handle player moves
  app.put("/v1/game/:gameID", async (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: "Unauthorized" });

    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game)
        return res
          .status(404)
          .send({ error: `Unknown game: ${req.params.gameID}` });
      if (game.owner.toString() !== req.session.user._id)
        return res.status(403).send({ error: "Forbidden" });

      // Initialize undo/redo stacks in session
      const { undoStack, redoStack } = getUndoRedoStacks(req, game._id.toString());

      const currentState = game.state.toJSON();
      const requestedMove = req.body;

      const validation = validateMove(currentState, requestedMove);
      if (validation.error) {
        return res.status(400).send({ error: validation.error });
      }

      // Save the current state for undo
      undoStack.push(JSON.parse(JSON.stringify(currentState)));
      // Clear redo stack on new move
      redoStack.length = 0;

      // Update game state and score
      game.state = validation.newState;
      game.markModified("state"); // Let Mongoose know the state has changed
      game.moves += 1;
      game.score = validation.newState.score;

      // Check for win condition
      if (
        game.state.stack1.length === 13 &&
        game.state.stack2.length === 13 &&
        game.state.stack3.length === 13 &&
        game.state.stack4.length === 13
      ) {
        game.won = true;
      }

      await game.save();

      const newMove = new Move({
        game: game._id,
        user: req.session.user._id,
        cards: requestedMove.cards,
        src: requestedMove.src,
        dst: requestedMove.dst,
        date: Date.now(),
        state: validation.newState,
      });
      await newMove.save();

      res
        .status(200)
        .send({ ...game.state.toJSON(), score: game.score, won: game.won });
    } catch (err) {
      console.error(`Error handling move: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });
  // Route to get user profile games
  app.get("/v1/user/:username", async (req, res) => {
    try {
      const user = await app.models.User.findOne({ username: req.params.username }).populate({
        path: "games",
        select: "start moves score type active",
      });

      if (!user) return res.status(404).send({ error: `User not found: ${req.params.username}` });

      const games = user.games.map((game) => ({
        ...game._doc,
        start: game.start ? new Date(game.start).toLocaleString() : "Invalid Date",
        type: game.type || "Unknown", // Default to "Unknown" if type is missing
      }));

      res.status(200).json({ username: user.username, games });
    } catch (err) {
      console.error(`Error fetching user profile: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });


  app.post("/v1/game/:gameID/draw", async (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: "Unauthorized" });

    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game) return res.status(404).send({ error: `Unknown game: ${req.params.gameID}` });
      if (game.owner.toString() !== req.session.user._id)
        return res.status(403).send({ error: "Forbidden" });

      // Initialize undo/redo stacks in session
      const { undoStack, redoStack } = getUndoRedoStacks(req, game._id.toString());

      const currentState = game.state.toJSON();
      const drawCount = game.drawCount || 1;

      // Save the current state for undo
      undoStack.push(JSON.parse(JSON.stringify(currentState)));
      redoStack.length = 0; // Clear redo stack on new move

      // Draw cards from the "draw" pile
      if (currentState.draw.length > 0) {
        const cardsToDraw = Math.min(drawCount, currentState.draw.length);
        const drawnCards = currentState.draw.splice(-cardsToDraw, cardsToDraw);
        drawnCards.forEach((card) => (card.up = true));
        currentState.discard.push(...drawnCards);
      }

      // Reset the draw pile if empty
      if (currentState.draw.length === 0 && currentState.discard.length > 0) {
        currentState.draw = currentState.discard
          .map((card) => ({ ...card, up: false })) // Flip cards face-down
          .reverse(); // Reverse to simulate reshuffling
        currentState.discard = []; // Clear the discard pile
      }

      // Handle case where both draw and discard are empty
      if (currentState.draw.length === 0 && currentState.discard.length === 0) {
        return res.status(400).send({ error: "No more cards to draw." });
      }

      // Save the updated state
      game.state = currentState;
      game.markModified("state"); // Notify Mongoose of the state change
      game.moves += 1;
      await game.save();

      res.status(200).send({ ...currentState, score: game.score, won: game.won });
    } catch (err) {
      console.error(`Error handling draw: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });




  // Route to handle autocomplete
  app.post("/v1/game/:gameID/autocomplete", async (req, res) => {
    if (!req.session.user) return res.status(401).send({ error: "Unauthorized" });

    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game)
        return res
          .status(404)
          .send({ error: `Unknown game: ${req.params.gameID}` });

      // Initialize undo/redo stacks in session
      const { undoStack, redoStack } = getUndoRedoStacks(req, game._id.toString());

      let currentState = JSON.parse(JSON.stringify(game.state.toJSON()));

      // Save the current state for undo
      undoStack.push(JSON.parse(JSON.stringify(currentState)));
      // Clear redo stack on new move
      redoStack.length = 0;

      let moved;
      let movesMade = 0;
      let cyclesThroughDeck = 0;
      const maxCyclesThroughDeck = 3; // Limit the number of times to go through the deck to prevent infinite loops

      do {
        moved = false;

        // Try moving cards from tableau piles to foundation stacks
        for (let pile of ["pile1", "pile2", "pile3", "pile4", "pile5", "pile6", "pile7"]) {
          if (currentState[pile].length > 0) {
            const card = currentState[pile][currentState[pile].length - 1];
            if (!card.up) continue; // Skip face-down cards

            for (let stack of ["stack1", "stack2", "stack3", "stack4"]) {
              const move = { cards: [card], src: pile, dst: stack };
              const validation = validateMove(currentState, move);
              if (!validation.error) {
                currentState = validation.newState;
                movesMade += 1;
                moved = true;
                break; // Move only one card at a time
              }
            }
            if (moved) break; // Restart from first pile
          }
        }

        // Try moving card from discard pile to foundation stacks
        if (!moved && currentState.discard.length > 0) {
          const card = currentState.discard[currentState.discard.length - 1];
          for (let stack of ["stack1", "stack2", "stack3", "stack4"]) {
            const move = { cards: [card], src: "discard", dst: stack };
            const validation = validateMove(currentState, move);
            if (!validation.error) {
              currentState = validation.newState;
              movesMade += 1;
              moved = true;
              break;
            }
          }
        }

        // If no moves, draw cards and try again
        if (!moved && (currentState.draw.length > 0 || currentState.discard.length > 0)) {
          // Simulate drawing a card
          if (currentState.draw.length > 0) {
            const drawCount = game.drawCount || 1;
            const cardsToDraw = Math.min(drawCount, currentState.draw.length);
            const drawnCards = currentState.draw.splice(-cardsToDraw, cardsToDraw);
            drawnCards.forEach((card) => (card.up = true));
            currentState.discard.push(...drawnCards);
            movesMade += 1;
            moved = true;
          } else if (currentState.discard.length > 0 && cyclesThroughDeck < maxCyclesThroughDeck) {
            // Reset the draw pile from the discard pile
            currentState.draw = currentState.discard
              .map((card) => ({ ...card, up: false }))
              .reverse();
            currentState.discard = [];
            cyclesThroughDeck += 1;
            movesMade += 1;
            moved = true;
          }
        }
      } while (moved);

      game.state = currentState;
      game.markModified("state"); // Let Mongoose know the state has changed

      // Update game moves and score
      game.moves += movesMade;
      game.score = currentState.score;

      // Check for win condition
      if (
        currentState.stack1.length === 13 &&
        currentState.stack2.length === 13 &&
        currentState.stack3.length === 13 &&
        currentState.stack4.length === 13
      ) {
        game.won = true;
      }

      await game.save();

      res.status(200).send({ ...currentState, score: game.score, won: game.won });
    } catch (err) {
      console.error(`Error handling autocomplete: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Route to check if game is over
  app.get("/v1/game/:gameID/checkGameOver", async (req, res) => {
    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game)
        return res
          .status(404)
          .send({ error: `Unknown game: ${req.params.gameID}` });

      const state = game.state.toJSON();
      const noMovesToFoundation = !hasValidMovesToFoundation(state, game.drawCount || 1);

      res.status(200).send({ gameOver: noMovesToFoundation && game.won === false });
    } catch (err) {
      console.error(`Error checking game over: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Function to check if there are valid moves to the foundations, considering drawing cards
  const hasValidMovesToFoundation = (state, drawCount) => {
    let currentState = JSON.parse(JSON.stringify(state));
    let moved;
    let cyclesThroughDeck = 0;
    const maxCyclesThroughDeck = 3; // Limit the number of times to go through the deck to prevent infinite loops

    do {
      moved = false;

      // Check tableau piles
      for (let pile of ["pile1", "pile2", "pile3", "pile4", "pile5", "pile6", "pile7"]) {
        if (currentState[pile].length > 0) {
          const card = currentState[pile][currentState[pile].length - 1];
          if (!card.up) continue; // Skip face-down cards

          for (let stack of ["stack1", "stack2", "stack3", "stack4"]) {
            const move = { cards: [card], src: pile, dst: stack };
            const validation = validateMove(currentState, move);
            if (!validation.error) {
              return true; // Found a valid move
            }
          }
        }
      }

      // Check discard pile
      if (currentState.discard.length > 0) {
        const card = currentState.discard[currentState.discard.length - 1];
        for (let stack of ["stack1", "stack2", "stack3", "stack4"]) {
          const move = { cards: [card], src: "discard", dst: stack };
          const validation = validateMove(currentState, move);
          if (!validation.error) {
            return true; // Found a valid move
          }
        }
      }

      // If no moves, simulate drawing cards
      if (currentState.draw.length > 0 || currentState.discard.length > 0) {
        // Simulate drawing a card
        if (currentState.draw.length > 0) {
          const cardsToDraw = Math.min(drawCount, currentState.draw.length);
          const drawnCards = currentState.draw.splice(-cardsToDraw, cardsToDraw);
          drawnCards.forEach((card) => (card.up = true));
          currentState.discard.push(...drawnCards);
          moved = true;
        } else if (currentState.discard.length > 0 && cyclesThroughDeck < maxCyclesThroughDeck) {
          // Reset the draw pile from the discard pile
          currentState.draw = currentState.discard
            .map((card) => ({ ...card, up: false }))
            .reverse();
          currentState.discard = [];
          cyclesThroughDeck += 1;
          moved = true;
        }
      }
    } while (moved);

    return false; // No valid moves to foundation
  };

  // Route to handle undo
  app.post("/v1/game/:gameID/undo", async (req, res) => {
    if (!req.session.user)
      return res.status(401).send({ error: "Unauthorized" });

    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game)
        return res
          .status(404)
          .send({ error: `Unknown game: ${req.params.gameID}` });

      // Initialize undo/redo stacks in session
      const { undoStack, redoStack } = getUndoRedoStacks(
        req,
        game._id.toString()
      );

      if (undoStack && undoStack.length > 1) {
        // Pop the current state from undo stack and push it onto redo stack
        redoStack.push(JSON.parse(JSON.stringify(game.state.toJSON())));
        // Set game state to the previous state
        const previousState = undoStack.pop();
        game.state = previousState;
        game.markModified("state"); // Ensure Mongoose detects the change

        // Update game.won status
        game.won =
          game.state.stack1.length === 13 &&
          game.state.stack2.length === 13 &&
          game.state.stack3.length === 13 &&
          game.state.stack4.length === 13;

        await game.save();
        res.status(200).send({ ...previousState, score: game.score, won: game.won });
      } else {
        res.status(400).send({ error: "No more moves to undo" });
      }
    } catch (err) {
      console.error(`Error handling undo: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Route to handle redo
  app.post("/v1/game/:gameID/redo", async (req, res) => {
    if (!req.session.user)
      return res.status(401).send({ error: "Unauthorized" });

    try {
      const game = await app.models.Game.findById(req.params.gameID);
      if (!game)
        return res
          .status(404)
          .send({ error: `Unknown game: ${req.params.gameID}` });

      // Initialize undo/redo stacks in session
      const { undoStack, redoStack } = getUndoRedoStacks(
        req,
        game._id.toString()
      );

      if (redoStack && redoStack.length > 0) {
        // Push current state onto undo stack
        undoStack.push(JSON.parse(JSON.stringify(game.state.toJSON())));
        // Set game state to the next state
        const nextState = redoStack.pop();
        game.state = nextState;
        game.markModified("state"); // Ensure Mongoose detects the change

        // Update game.won status
        game.won =
          game.state.stack1.length === 13 &&
          game.state.stack2.length === 13 &&
          game.state.stack3.length === 13 &&
          game.state.stack4.length === 13;

        await game.save();
        res.status(200).send({ ...nextState, score: game.score, won: game.won });
      } else {
        res.status(400).send({ error: "No more moves to redo" });
      }
    } catch (err) {
      console.error(`Error handling redo: ${err}`);
      res.status(500).send({ error: "Internal server error" });
    }
  });

  // Routes for debugging and card utilities
  app.get("/v1/cards/shuffle", (req, res) => res.send(shuffleCards(false)));
  app.get("/v1/cards/initial", (req, res) => res.send(initialState()));
};
