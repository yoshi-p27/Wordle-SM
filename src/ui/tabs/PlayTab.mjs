import { WordleGame } from "../../core/WordleGame.mjs";

export function renderPlayTab(ui, state, wordList) {
  const { users, currentUser, currentGame } = state;
  const { targetWord, guesses, gameOver, won, currentGameStart } = currentGame;
  const userHistory = users[currentUser].history;

  ui.md`### Current Game`;

  const guessForm = ui.form("guess_form", {
    fields: {
      word: ui.string("word", {
        required: true,
        label: "Enter your guess",
        placeholder: "5-letter word..."
      })
    },
    action: ui.submitButton("submit_guess", {
      label: "Submit Guess",
      disabled: gameOver
    })
  });

  if (guessForm.didSubmit) {
    const tempGame = new WordleGame(wordList);
    tempGame.targetWord = targetWord;
    tempGame.guesses = guesses;
    tempGame.gameOver = gameOver;
    tempGame.won = won;

    const result = tempGame.makeGuess(guessForm.val.word);

    if (result.error) {
      ui.md`⚠️ **Error:** ${result.error}`;
    } else {
      const newCurrentGame = {
        targetWord: targetWord,
        guesses: tempGame.guesses,
        gameOver: tempGame.gameOver,
        won: tempGame.won,
        currentGameStart: currentGameStart
      };

      if (tempGame.gameOver && !gameOver) {
        const completedGame = {
          id: userHistory.length + 1,
          targetWord: targetWord,
          guesses: tempGame.guesses,
          won: tempGame.won,
          timestamp: Date.now(),
          duration: Date.now() - currentGameStart
        };

        users[currentUser].history.push(completedGame);
      }

      ui.setState(() => ({
        users: users,
        currentUser: currentUser,
        currentGame: newCurrentGame
      }), "global_game_state");
    }
  }

  // Game over messages
  if (gameOver && won) {
    ui.md`## 🎉 You won in ${guesses.length} guesses!`;
  } else if (gameOver && !won) {
    ui.md`## 😞 Game Over! The word was: **${targetWord}**`;
  }

  // Display game board
  if (guesses.length > 0) {
    const displayGame = new WordleGame(wordList);
    displayGame.targetWord = targetWord;
    displayGame.guesses = guesses;
    displayGame.gameOver = gameOver;
    displayGame.won = won;

    const tableData = displayGame.formatForTable();
    const tableConfig = displayGame.getTableConfig();

    ui.table("wordle_board", tableData, tableConfig);
  } else {
    ui.md`_No guesses yet. Start playing!_`;
  }

  ui.md`**Guesses:** ${guesses.length} / 6`;

  // Keyboard state
  if (guesses.length > 0) {
    const displayGame = new WordleGame(wordList);
    displayGame.targetWord = targetWord;
    displayGame.guesses = guesses;

    const keyboard = displayGame.getKeyboardState();
    const correctLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'correct').join(', ') || 'None';
    const presentLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'present').join(', ') || 'None';
    const absentLetters = Object.keys(keyboard).filter(k => keyboard[k] === 'absent').join(', ') || 'None';

    ui.md`
**Keyboard State:**
- 🟩 Correct (Green): ${correctLetters}
- 🟨 Present (Yellow): ${presentLetters}
- ⬜ Absent (Gray): ${absentLetters}
    `;
  }

  // New Game button
  const resetBtn = ui.button("reset_btn", {
    label: "New Game"
  });

  if (resetBtn.didClick) {
    const newGame = new WordleGame(wordList);
    ui.setState(() => ({
      users: users,
      currentUser: currentUser,
      currentGame: {
        targetWord: newGame.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    }), "global_game_state");
  }
}