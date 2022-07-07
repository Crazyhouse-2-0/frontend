import React from 'react';
import axios from 'axios';
import { Chess } from 'chess.js';
import Chessboard from 'chessboardjs';
import $ from 'jquery';

class PlayGame extends React.Component {
    constructor(props) {
        super(props);
        let id = window.location.href.split("/").at(-1)

        if (!localStorage.getItem('username')){
            this.state = {
                GameId: id,
                config: null,
                game: null,
                board: null,
                username: null,
                color: null,
                mymove: true,
                wmoves: [],
                bmoves: [],
            }
        }else{
            this.state = {
                GameId: id,
                config: null,
                game: null,
                board: null,
                username: localStorage.getItem('username').replace(/^"(.+)"$/,'$1'),
                color: null,
                mymove: true,
                wmoves: [],
                bmoves: [],
            }
        } 
    }

    onDrop = async (source, target, piece, newPos, oldPos, orientation) => {
        if (source===target){
          return;
        }
        
        // see if the move is legal
        var move = this.state.game.move({
            from: source,
            to: target,
            promotion: 'q' // NOTE: always promote to a queen for example simplicity
          })

        // illegal move
        // currently does not support insanehouse feature of being able ot move new pieces
        // will have to code it myself -_-
        if (source!=="spare"){
            if (move === null) {
                console.log("bruh");
                return 'snapback'
            }
        }

        // if move is legal, output information to console
        console.log('Source: ' + source)
        console.log('Target: ' + target)
        console.log('Piece: ' + piece)
        console.log('New position: ' + Chessboard.objToFen(newPos))
        console.log('Old position: ' + Chessboard.objToFen(oldPos))
        console.log('Orientation: ' + orientation)
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        //console.log(fenToGrid(Chessboard.objToFen(newPos)));

        // remove potential landing squares once move is completed
        this.removeGreySquares()
        
        // Flip board 
        //this.state.board.flip()

        // append new move to corresponding move array
        if (this.state.color === "white"){
            await this.setState(prevState => ({
                wmoves: [...prevState.wmoves, source+"-"+target]
            }))
            
            axios.put(`https://crazyhousebackend.herokuapp.com/game/${window.location.href.split("/").at(-1)}`, {wmoves: this.state.wmoves, fen: Chessboard.objToFen(newPos)})
                .then((Response) => {
                    console.log(Response.data)
                }
            )
        }else{
            await this.setState(prevState => ({
                bmoves: [...prevState.bmoves, source+"-"+target]
            }))
            
            axios.put(`https://crazyhousebackend.herokuapp.com/game/${window.location.href.split("/").at(-1)}`, {bmoves: this.state.bmoves, fen: Chessboard.objToFen(newPos)})
                .then((Response) => {
                    console.log(Response.data)
                }
            )
        }
        this.setState({
            mymove: false,
        })
    }

    onSnapEnd = () => {
        this.state.board.position(this.state.game.fen())
    }
    
    removeGreySquares = () => {
      $('.square-55d63').css('background', '')
    }
    greySquare = (square) => {
      var $square = $('.square-' + square)
    
      var background = '#a9a9a9'
      if ($square.hasClass('black-3c85d')) {
        background = '#696969'
      }
    
      $square.css('background', background)
    }
    onDragStart = (source, piece) => {
      // do not pick up pieces if the game is over
      if (this.state.game.game_over()) return false
    
      // or if it's not that side's turn
      if ((this.state.game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (this.state.game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false
      }
    }
    onMouseoverSquare = (square, piece) => {
      // get list of possible moves for this square
      var moves = this.state.game.moves({
        square: square,
        verbose: true
      })
      //console.log(moves);
      //console.log(k_moves(squareToArr(square)))
      // exit if there are no moves available for this square
      if (moves.length === 0) return
    
      // highlight the square they moused over
      this.greySquare(square)
    
      // highlight the possible squares for this piece
      for (var i = 0; i < moves.length; i++) {
        this.greySquare(moves[i].to)
      }
    }
    onMouseoutSquare = (square, piece) => {
      this.removeGreySquares(square)
    }

    async componentDidMount() {
        // if not logged in, then do noto load gameData
        if(!this.state.username){
            return
        }
        
        // initialize chessboard js functions, gameId
        await this.setState({
            GameId: window.location.href.split("/").at(-1),
            config: {
                draggable: true,
                dropOffBoard: 'snapback', // this is the default
                position: 'start',
                //onDragMove: onDragMove,
                //onSnapbackEnd: onSnapbackEnd,
                onDrop: this.onDrop,
                onDragStart: this.onDragStart,
                onMouseoutSquare: this.onMouseoutSquare,
                onMouseoverSquare: this.onMouseoverSquare,
                onSnapEnd: this.onSnapEnd,
                sparePieces: true
            },
        })

        //initialize game and board using config set above
        await this.setState({
            game: new Chess(),
            board: Chessboard('board', this.state.config)
        })
        // get GameData, determine current user color and set mymove
        let gameData;

        await axios.get(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`)
            .then((Response) => {
                gameData = Response.data
                console.log(gameData)
                
                // if no players are set, then current user is first one to join this game
                if(!gameData.white && !gameData.black){
                    if (Math.random()<=0.5){ // randomly generate color for first player
                        this.setState({
                            color: "white",
                        })
                        axios.put(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`, {white: this.state.username})
                    }else{
                        this.setState({
                            color: "black",
                            mymove: false,
                        })
                        axios.put(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`, {black: this.state.username})
                        this.state.board.flip()
                    }
                    console.log(`First player, you are playing ${this.state.color}`)
                }
                // both players are set, so game is already full
                else if (gameData.white && gameData.black){
                    console.log("Game Full")
                    if (this.state.username !== gameData.white && this.state.username !== gameData.black) { // if this user is not any of the existing players
                        this.setState({
                            color: false,
                        })
                        document.getElementsByClassName('col').innerHTML = <div>This game is already full.</div>
                    }
                    // if the user is one of the existing players, no need to do anything
                    // in future would ideally get fen and moves from db, and setState
                }
                // if white player exists
                else if (gameData.white){
                    if (this.state.username !== gameData.white) { //if current user is not the white player, set them to black
                        this.setState({
                            color: "black",
                            mymove: false,
                        })
                        console.log(`Second player, you are playing ${this.state.color}`)
                        axios.put(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`, {black: this.state.username})
                        this.state.board.flip()
                    }
                }
                // only other possible condition is black player is only player to exist
                else{
                    // same as above (mymove defaults as true in constructor)
                    if (this.state.username !== gameData.black) {
                        this.setState({
                            color: "white",
                        })
                        console.log(`Second player, you are playing ${this.state.color}`)
                        axios.put(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`, {white: this.state.username})
                    };
                }
                
                // listen for any new moves made by opponent
                this.newMoves = setInterval(
                    () => this.getMovesAndUpdate(),
                    1000
                );

            });
            // allow board to resize with window
            await $(window).on('resize', this.state.board.resize);
    }

    // clear interval as appropriate
    async componentWillUnmount(){
        await clearInterval(this.newMoves);
    }

    getMovesAndUpdate = async () => {
        await axios.get(`https://crazyhousebackend.herokuapp.com/game/${this.state.GameId}`)
            .then((Response) => {

                if(this.state.color === "white"){

                    // if lengths are not matching, then new move was made
                    if(Response.data.bmoves.length!==this.state.bmoves.length){
                        const newMove = Response.data.bmoves[Response.data.bmoves.length-1]; // newest move is at end of array

                        // TODO: implement if newMove.split("-").at(0) is "spare"

                        if (newMove.split("-").at(0) === "spare"){
                            let newFen = Response.data.fen; //get fen data from db
                            let fenArr = newFen.split(" "); // split fen by " " 
                            this.state.board.position(fenArr[0]); // set new position on board
                            this.state.game.load(fenArr[0]); // set new position on game
                            //const boardPos = this.state.board.position();
                        }
                        /*
                        - from mongoDB fen, determine which type of piece was added to the board (would be opposite color)
                        - make that move on the board
                        - this.state.game.load(fen)
                            - determine new fen from mongoDB fen, current fen with more info like who to move, castling, en passant
                            - change who to move
                            - castling remains unchanged
                            - set en passant value to "-" or null
                            - set half-move counter to 0
                            - increment full move number if black moved
                        */

                        // update local state
                        this.setState(prevState => ({
                            bmoves: [...prevState.bmoves, newMove]
                        }))

                        // sloppy allows for game.move to accept oldSquare-newSquare
                        this.state.game.move(newMove, {sloppy: true})

                        //update current board position
                        this.state.board.position(this.state.game.fen())

                        if (this.state.mymove===false){
                            this.setState({
                                mymove: true,
                            })
                        }
                    }
                }else{
                    // Same as above
                    if(Response.data.wmoves.length!==this.state.wmoves.length){

                        const newMove = Response.data.wmoves[Response.data.wmoves.length-1]

                        this.setState(prevState => ({
                            wmoves: [...prevState.wmoves, newMove]
                        }))

                        this.state.game.move(newMove, {sloppy: true})

                        this.state.board.position(this.state.game.fen())

                        if (this.state.mymove===false){
                            this.setState({
                                mymove: true,
                            })
                        }
                    }
                }
            })
    }

    render() {
        if (!this.state.username) {
            return (
                <div>
                    You are not logged in.
                </div>
            )
        } 
        return ( 
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col s6 push-s1'>
                        <br />
                        <div id="board" style={{width: '70%'}}></div>
                    </div>
                </div>
            </div>
        );
    }
}
 
export default PlayGame;