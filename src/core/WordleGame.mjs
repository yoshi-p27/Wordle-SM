export class WordleGame {
  constructor(wordList, maxGuesses = 6) {
    this.wordList = wordList.map(w => w.toUpperCase());
    this.maxGuesses = maxGuesses;
    this.wordLength = 5;
    this.reset();
  }

  reset() {
    this.targetWord = this.selectRandomWord();
    this.guesses = [];
    this.gameOver = false;
    this.won = false;
  }

  selectRandomWord() {
    return this.wordList[Math.floor(Math.random() * this.wordList.length)];
  }

  isValidWord(word) {
    return word.length === this.wordLength && 
           this.wordList.includes(word.toUpperCase());
  }

  makeGuess(word) {
    word = word.toUpperCase();

    if (this.gameOver) {
      return { error: 'Game is already over' };
    }

    if (word.length !== this.wordLength) {
      return { error: `Word must be ${this.wordLength} letters` };
    }

    if (!this.isValidWord(word)) {
      return { error: 'Not a valid word' };
    }

    if (this.guesses.some(g => g.word === word)) {
      return { error: 'You already guessed this word' };
    }

    const result = this.evaluateGuess(word);
    this.guesses.push({ word, result });

    if (word === this.targetWord) {
      this.gameOver = true;
      this.won = true;
    }

    if (this.guesses.length >= this.maxGuesses && !this.won) {
      this.gameOver = true;
    }

    return {
      result,
      gameOver: this.gameOver,
      won: this.won,
      guessesRemaining: this.maxGuesses - this.guesses.length,
      targetWord: this.gameOver ? this.targetWord : null
    };
  }

  evaluateGuess(word) {
    const result = Array(this.wordLength).fill('absent');
    const targetLetters = this.targetWord.split('');
    const guessLetters = word.split('');
    const used = Array(this.wordLength).fill(false);

    for (let i = 0; i < this.wordLength; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        result[i] = 'correct';
        used[i] = true;
      }
    }

    for (let i = 0; i < this.wordLength; i++) {
      if (result[i] === 'correct') continue;

      for (let j = 0; j < this.wordLength; j++) {
        if (!used[j] && guessLetters[i] === targetLetters[j]) {
          result[i] = 'present';
          used[j] = true;
          break;
        }
      }
    }

    return result;
  }

  formatForTable() {
    const rows = [];

    for (let guessIndex = 0; guessIndex < this.guesses.length; guessIndex++) {
      const guess = this.guesses[guessIndex];
      const row = {
        id: guessIndex + 1,
        guess_num: guessIndex + 1
      };

      for (let letterIndex = 0; letterIndex < guess.word.length; letterIndex++) {
        const letter = guess.word[letterIndex];
        const status = guess.result[letterIndex];

        let color = 'cat-9';
        if (status === 'correct') {
          color = 'cat-3';
        } else if (status === 'present') {
          color = 'cat-6';
        }

        row[`letter_${letterIndex + 1}`] = {
          label: letter,
          color: color
        };
      }

      rows.push(row);
    }

    return rows;
  }

  getTableConfig() {
    return {
      columns: {
        "*": { search: false },
        id: { isId: true, label: "#", hidden: true },
        guess_num: { isId: true, label: "Guess" },
        letter_1: { label: "1", format: "pill" },
        letter_2: { label: "2", format: "pill" },
        letter_3: { label: "3", format: "pill" },
        letter_4: { label: "4", format: "pill" },
        letter_5: { label: "5", format: "pill" },
      },
      size: "rows"
    };
  }

  getKeyboardState() {
    const state = {};

    for (const guess of this.guesses) {
      for (let i = 0; i < guess.word.length; i++) {
        const letter = guess.word[i];
        const status = guess.result[i];

        if (!state[letter] || 
            (state[letter] === 'absent' && status !== 'absent') ||
            (state[letter] === 'present' && status === 'correct')) {
          state[letter] = status;
        }
      }
    }

    return state;
  }
}