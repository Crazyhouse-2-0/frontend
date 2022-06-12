import { Chess } from "./chess.js";

let config = {
  draggable: true,
  dropOffBoard: 'snapback', // this is the default
  position: 'start',
  //onDragMove: onDragMove,
  //onSnapbackEnd: onSnapbackEnd,
  onDrop: onDrop,
  onDragStart: onDragStart,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  //onSnapEnd: onSnapEnd,
  sparePieces: true
}

var whiteSquareGrey = '#a9a9a9'
var blackSquareGrey = '#696969'

var myMove = true;

const rows = [...Array(8).keys()].map((i) => String.fromCharCode(i+97));
const cols = [...Array(8).keys()].map((i) => `${i+1}`)

const grid = []

cols.forEach((col) => {
  var rank = [];
  rows.forEach((row) => {
    rank.push(`${row}${col}`)
  })
  grid.push(rank);
})

//returns a 8x8 array with each cell containing 
const fenToGrid = (FEN) => {
  const lines = FEN.split("/");
  let grid = []
  lines.forEach((line) => {
    let newline = [];
    line.split("").forEach((char) => {
      if(isNaN(parseInt(char))){
        newline.push(char);
      }else{
        for(let i = 0; i<parseInt(char);i++){
          newline.push("1")
        }
      }
    })
    grid.push(newline);
  })
  return grid;
}

function squareToArr(square) {//converts "a1" -> [0,0]
  return [square.charCodeAt(0)-97, parseInt(square.charAt(1))-1];
}
function arrToSquare(arr){ //converts [0,0] -> "a1"
  return `${String.fromCharCode(arr[0]+97)}${arr[1]+1}`
}

async function onDrop (source, target, piece, newPos, oldPos, orientation) {
    if (source===target){
      return;
    }
    console.log('Source: ' + source)
    console.log('Target: ' + target)
    console.log('Piece: ' + piece)
    console.log('New position: ' + Chessboard.objToFen(newPos))
    console.log('Old position: ' + Chessboard.objToFen(oldPos))
    console.log('Orientation: ' + orientation)
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
    console.log(fenToGrid(Chessboard.objToFen(newPos)));
    removeGreySquares()

    // see if the move is legal
    var move = game.move({
      from: source,
      to: target,
      promotion: 'q' // NOTE: always promote to a queen for example simplicity
    })

    // illegal move
    // currently does not support insanehouse feature of being able ot move new pieces
    // will have to code it myself -_-
    if (source!="spare") {
      if (move === null) {
        console.log("bruh");
        return 'snapback'
      }
    }
    board.flip()
    let whitemoves = [];
    await axios.get(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`)
        .then((Response) => {
            Response.data.wmoves.forEach((move) => {
                whitemoves.push(move)
            })
        })
    await whitemoves.push(source + "-" + target)
    await console.log(whitemoves)
    axios.put(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`, {wmoves: whitemoves, fen: Chessboard.objToFen(newPos)})
        .then((Response) => {
            console.log(Response.data)
        })

  }

function removeGreySquares () {
  $('.square-55d63').css('background', '')
}
function greySquare (square) {
  var $square = $('.square-' + square)

  var background = whiteSquareGrey
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey
  }

  $square.css('background', background)
}

function onDragStart (source, piece) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false

  // or if it's not that side's turn
  if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
}
function onMouseoverSquare (square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true
  })
  //console.log(moves);
  //console.log(k_moves(squareToArr(square)))
  // exit if there are no moves available for this square
  if (moves.length === 0) return

  // highlight the square they moused over
  greySquare(square)

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to)
  }
}
function onMouseoutSquare (square, piece) {
  removeGreySquares(square)
}

let game = new Chess();
let board = Chessboard('board',config);
$(window).resize(board.resize)