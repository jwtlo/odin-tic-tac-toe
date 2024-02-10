// Factory function for cells
// Enforced invariant: a cell's value must either by "", "X", or "O"
const makeCell = () => {
  let value = "";
  const getValue = () => value;
  const setValue = (newValue) => {
    if (!value && (newValue === "X" || newValue === "O")) value = newValue;
  }
  const clearValue = () => value = "";

  return {getValue, setValue, clearValue};
}

// gameboard object created using IIFE module paradigm
const Gameboard = (function () {
  const board = [];

  const initializeBoard = () => {
    for (let i = 0; i < 3; i++) {
      const row = []
      for (let j = 0; j < 3; j++) {
        row.push(makeCell());
      }
      board.push(row);
    }
  };
  
  initializeBoard();

  const markBoard = (row, col, mark) => {
    const cell = board[row][col];
    if (cell.getValue() !== "") {
      console.warn(`row ${row}, col ${col} already has a ${cell.getValue()}`);
    } else {
      cell.setValue(mark);
    }
  };

  const checkWin = () => {
    // Rows
    for (const row of board) {
      const values = row.map((cell) => cell.getValue());
      if (values[0] && values[1] === values[0] && values[2] === values[0]) return values[0];
    }
    // Cols
    for (let j = 0; j < 3; j++) {
      if (board[0][j].getValue()) {
        if (board[1][j].getValue() === board[0][j].getValue() && board[2][j].getValue() === board[0][j].getValue()) {
          return board[0][j].getValue();
        }
      }
    }
    //Diagonals
    if (board[0][0].getValue()) {
      if (board[1][1].getValue() === board[0][0].getValue() && board[2][2].getValue() === board[0][0].getValue()) {
        return board[0][0].getValue();
      }
    }
    if (board[0][2].getValue()) {
      if (board[1][1].getValue() === board[0][2].getValue() && board[2][0].getValue() === board[0][2].getValue()) {
        return board[0][2].getValue();
      }
    }
  };

  const clearBoard = () => {
    board.forEach((row) => {
      row.forEach((cell) => cell.clearValue());
    });
  };

  const logBoard = () => {
    board.forEach((row) => {
      const rowVals = row.map((cell) => cell.getValue()).join(" | ");
      console.log("\n" + rowVals)
      console.log("-".repeat(10));
    })
  };

  return {markBoard, checkWin, clearBoard, logBoard};
}) ();

// controller object created using IIFE module paradigm
const Controller = (function () {
  // gamestate
  const board = Gameboard;
  let turn = "X";

  const nextTurn = () => turn = turn === "X" ? "O" : "X";

  const playTurn = () => {
    // First, get valid row and column
    let row = prompt("Which row?");
    let col = prompt("Which column?");

    board.markBoard(row, col, turn);
    nextTurn();
  };

  const startGame = () => {
    console.log("Let's play Tic-Tac-Toe!")

    let winner;
    while (!(winner = board.checkWin())) {
      board.logBoard();
      playTurn();
    }

    board.logBoard();
    console.log("The winner is " + winner);
    resetGame();
  };

  const resetGame = () => {
    board.clearBoard();
    startGame();
  };

  return {startGame};
}) ();