const boardElement = document.getElementById("board");
const statusElement = document.getElementById("status");

let board = [];
let selected = null;
let currentPlayer = "w";
let vsAI = false;
let history = [];

// Unicode chess pieces
const PIECES = {
  r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", p: "♟",
  R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔", P: "♙"
};

function initBoard() {
  board = [
    "rnbqkbnr",
    "pppppppp",
    "........",
    "........",
    "........",
    "........",
    "PPPPPPPP",
    "RNBQKBNR"
  ].map(r => r.split(""));
  currentPlayer = "w";
  history = [];
  selected = null;
  drawBoard();
  updateStatus();
}

function drawBoard() {
  boardElement.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = `square ${(r + c) % 2 ? "black" : "white"}`;
      if (selected && selected.r === r && selected.c === c) {
        sq.classList.add("selected");
      }
      const piece = board[r][c];
      if (piece !== ".") sq.textContent = PIECES[piece];
      sq.onclick = () => onSquareClick(r, c);
      boardElement.appendChild(sq);
    }
  }
}

function onSquareClick(r, c) {
  const piece = board[r][c];
  if (selected) {
    if (isLegalMove(selected.r, selected.c, r, c)) {
      movePiece(selected.r, selected.c, r, c);
      selected = null;
      drawBoard();
      if (vsAI && currentPlayer === "b") {
        setTimeout(aiMove, 300);
      }
      return;
    }
    selected = null;
  } else {
    if (piece !== "." && isCurrentPlayerPiece(piece)) {
      selected = { r, c };
    }
  }
  drawBoard();
}

function movePiece(sr, sc, tr, tc) {
  history.push(JSON.parse(JSON.stringify(board)));
  board[tr][tc] = board[sr][sc];
  board[sr][sc] = ".";
  currentPlayer = currentPlayer === "w" ? "b" : "w";
  updateStatus();
}

function isCurrentPlayerPiece(p) {
  return currentPlayer === "w" ? p === p.toUpperCase() : p === p.toLowerCase();
}

function isLegalMove(sr, sc, tr, tc) {
  const piece = board[sr][sc];
  const target = board[tr][tc];
  if (target !== "." && isCurrentPlayerPiece(target)) return false;

  const dr = tr - sr;
  const dc = tc - sc;

  switch (piece.toLowerCase()) {
    case "p":
      const dir = piece === "P" ? -1 : 1;
      if (dc === 0 && target === "." && dr === dir) return true;
      return false;

    case "r":
      return dr === 0 || dc === 0;

    case "n":
      return Math.abs(dr * dc) === 2;

    case "b":
      return Math.abs(dr) === Math.abs(dc);

    case "q":
      return dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc);

    case "k":
      return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  return false;
}

function aiMove() {
  let moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c] !== "." && !isCurrentPlayerPiece(board[r][c])) {
        for (let tr = 0; tr < 8; tr++) {
          for (let tc = 0; tc < 8; tc++) {
            if (isLegalMove(r, c, tr, tc)) {
              moves.push({ r, c, tr, tc });
            }
          }
        }
      }
    }
  }
  if (moves.length === 0) return;
  const m = moves[Math.floor(Math.random() * moves.length)];
  movePiece(m.r, m.c, m.tr, m.tc);
  drawBoard();
}

function updateStatus() {
  statusElement.textContent =
    currentPlayer === "w" ? "White's turn" : "Black's turn";
}

document.getElementById("undoBtn").onclick = () => {
  if (history.length > 0) {
    board = history.pop();
    currentPlayer = currentPlayer === "w" ? "b" : "w";
    drawBoard();
    updateStatus();
  }
};

document.getElementById("resetBtn").onclick = initBoard;
document.getElementById("pvpBtn").onclick = () => {
  vsAI = false;
  initBoard();
};
document.getElementById("aiBtn").onclick = () => {
  vsAI = true;
  initBoard();
};

initBoard();
