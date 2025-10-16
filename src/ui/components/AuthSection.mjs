import { WordleGame } from "../../core/WordleGame.mjs";

export function renderAuthSection(ui, state, wordList) {
  const { users } = state;

  ui.md`# 🎮 Wordle Game`;
  ui.md`Please log in or sign up to play`;

  const loginForm = ui.form("login_form", {
    fields: {
      email: ui.email("email", {
        required: true,
        label: "Email",
        placeholder: "your@email.com"
      }),
      name: ui.string("name", {
        required: true,
        label: "Display Name",
        placeholder: "Your Name"
      })
    },
    action: ui.submitButton("login_submit", {
      label: "Login / Sign Up"
    })
  });

  if (loginForm.didSubmit) {
    const email = loginForm.val.email;
    const name = loginForm.val.name;

    const updatedUsers = { ...users };
    
    if (!updatedUsers[email]) {
      updatedUsers[email] = {
        name: name,
        history: [],
        createdAt: Date.now()
      };
    }

    const newGame = new WordleGame(wordList);
    
    return {
      users: updatedUsers,
      currentUser: email,
      currentGame: {
        targetWord: newGame.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    };
  }

  return null;
}

export function renderLogoutButton(ui, state, wordList) {
  const logoutBtn = ui.button("logout_btn", {
    label: "Logout"
  });

  if (logoutBtn.didClick) {
    const newGame = new WordleGame(wordList);
    return {
      users: state.users,
      currentUser: null,
      currentGame: {
        targetWord: newGame.targetWord,
        guesses: [],
        gameOver: false,
        won: false,
        currentGameStart: Date.now()
      }
    };
  }

  return null;
}