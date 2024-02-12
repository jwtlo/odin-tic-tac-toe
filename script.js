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

  const getBoardValues = ( )=> board.flat().map((cell) => cell.getValue());

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

  const checkResult = () => {
    // Rows
    for (let i = 0; i < 3; i++) {
      if (board[i][0].getValue()) {
        if (board[i][1].getValue() === board[i][0].getValue() && board[i][2].getValue() === board[i][0].getValue()) {
          return { result: board[i][0].getValue(), indices: [[i, 0], [i, 1], [1, 2]], };
        }
      }
    }
    // Cols
    for (let j = 0; j < 3; j++) {
      if (board[0][j].getValue()) {
        if (board[1][j].getValue() === board[0][j].getValue() && board[2][j].getValue() === board[0][j].getValue()) {
          return { result: board[0][j].getValue(), indices: [[0, j], [1, j], [2, j]], };
        }
      }
    }
    //Diagonals
    if (board[0][0].getValue()) {
      if (board[1][1].getValue() === board[0][0].getValue() && board[2][2].getValue() === board[0][0].getValue()) {
        return { result: board[0][0].getValue(), indices: [[0, 0], [1, 1], [2, 2]], };
      }
    }
    if (board[0][2].getValue()) {
      if (board[1][1].getValue() === board[0][2].getValue() && board[2][0].getValue() === board[0][2].getValue()) {
        return { result: board[0][2].getValue(), indices: [[0, 2], [1, 1], [2, 0]], };
      }
    }
    // Draw
    if (board.flat().filter((cell) => !cell.getValue()).length === 0  ) return { result: "-", indices: null }

    // No
    return { result: null, indices: null };
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

  return {board, getBoardValues, markBoard, checkResult, clearBoard, logBoard};
}) ();

// --------------------------------

// console controller object created using IIFE module paradigm
const ConsoleController = (function () {
  // gamestate
  const board = Gameboard;
  let turn = "X";

  const nextTurn = () => turn = turn === "X" ? "O" : "X";

  const playTurn = (row, col) => {
    // Assume row and column are valid
    board.markBoard(row, col, turn);
    nextTurn();
  };

  const startGame = () => {
    console.log("Let's play Tic-Tac-Toe!")

    let { result, indices } = board.checkResult();
    while (!result) {
      board.logBoard();
      const row = prompt("Which row?");
      const col = prompt("Which column?");
      playTurn(row, col);
      ({ result, indices } = board.checkResult());
    }

    board.logBoard();
    if (result === "=") console.log("It's a tie!")
    else console.log("The winner is " + result);
    resetGame();
  };

  const resetGame = () => {
    board.clearBoard();
    startGame();
  };

  return {startGame};
}) ();

// --------------------------------

const DOMController = (function () {
  const board = Gameboard;
  let turn = "X";
  let player1 = "Player 1";
  let player2 = "Player 2";

  const dialog = document.querySelector("dialog");
  const form = document.querySelector("form");
  const grid = document.querySelector("#board-grid");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let name1 = document.querySelector("#name-1").value;
    let name2 = document.querySelector("#name-2").value;
    setPlayers(name1, name2);

   dialog.close();
  })

  const setPlayers = (name1, name2) => {
    player1 = name1;
    player2 = name2;
  }

  const nextTurn = () => {
    if (turn === "X") {
      turn = "O";
      grid.classList.replace("X-turn", "O-turn");
    } else {
      turn = turn === "X" ? "O" : "X";
      grid.classList.replace("O-turn", "X-turn");
    }
  }

  const playTurn = (row, col) => {
    // Assume row and column are valid
    board.markBoard(row, col, turn);
    displayBoard();
    nextTurn();
  };

  const startGame = () => {
    board.clearBoard();
    turn = "X";
    grid.classList.remove("O-turn");
    grid.classList.remove("no-turn");
    grid.classList.add("X-turn");
    document.querySelector("#end-message").innerHTML = "";
    displayBoard();
    dialog.showModal();
  }

  const endGame = (result, indices) => {
    grid.classList.remove("O-turn");
    grid.classList.remove("X-turn");
    grid.classList.add("no-turn");
    
    const endMessage = document.querySelector("#end-message");

    if (result === "-") endMessage.textContent = "There is a tie!"
    else endMessage.textContent = (result === "X" ? player1 : player2) + " wins!"

    

    const button = document.createElement("button");
    button.id = "again-button";
    button.textContent = "Play again?"
    button.addEventListener("click", startGame);

    endMessage.appendChild(button);
    return;
  }

  const displayBoard = () => {
    const values = board.getBoardValues();
    grid.innerHTML = "";

    let { result, indices } = board.checkResult();
    for (const [i, value] of values.entries()) {
      const boardCell = document.createElement("div");
      boardCell.className = "board-cell";

      const cellContent = document.createElement("div");
      cellContent.className = "cell-content cell-" + (i + 1);
      
      // Add listener 
      if (!value) {
        if (!result) {
          boardCell.addEventListener("click", (e) => {
            playTurn(Math.floor(i/3), i%3);
          })
        }
      } else boardCell.classList.add(value);

      // Display cell content
      // cellContent.innerHTML = value;
      cellContent.innerHTML = 
      value ? `<img alt="${value}" src="./${value}.svg">` : "";

      boardCell.appendChild(cellContent);
      grid.appendChild(boardCell);
      
      if (result) {
        endGame(result, indices)
      }
    }
  }

  return {startGame, displayBoard};
}) ();