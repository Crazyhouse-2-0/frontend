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
        if (source!=="spare") {
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
            // let whitemoves = [];
            // await axios.get(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`)
            //     .then((Response) => {
            //         Response.data.wmoves.forEach((move) => {
            //             whitemoves.push(move)
            //         })
            //     })
            // await whitemoves.push(source + "-" + target)
            // await console.log(whitemoves)

            await this.setState(prevState => ({
                wmoves: [...prevState.wmoves, source+"-"+target]
            }))
            
            axios.put(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`, {wmoves: this.state.wmoves, fen: Chessboard.objToFen(newPos)})
                .then((Response) => {
                    console.log(Response.data)
                }
            )
        }else{

            // let blackmoves = [];
            // await axios.get(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`)
            //     .then((Response) => {
            //         Response.data.bmoves.forEach((move) => {
            //             blackmoves.push(move)
            //         })
            //     })
            // await blackmoves.push(source + "-" + target)
            // await console.log(blackmoves)

            await this.setState(prevState => ({
                bmoves: [...prevState.bmoves, source+"-"+target]
            }))
            
            axios.put(`http://localhost:4000/game/${window.location.href.split("/").at(-1)}`, {bmoves: this.state.bmoves, fen: Chessboard.objToFen(newPos)})
                .then((Response) => {
                    console.log(Response.data)
                }
            )
        }
        this.setState({
            mymove: false,
        })
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
        
        // initialize functions, gameId
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
                //onSnapEnd: onSnapEnd,
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

        await axios.get(`http://localhost:4000/game/${this.state.GameId}`)
            .then((Response) => {
                gameData = Response.data
                console.log(gameData)

                if(!gameData.white && !gameData.black){
                    if (Math.random()<=0.5){
                        this.setState({
                            color: "white",
                        })
                        console.log("ran")
                        axios.put(`http://localhost:4000/game/${this.state.GameId}`, {white: this.state.username})
                    }else{
                        this.setState({
                            color: "black",
                            mymove: false,
                        })
                        console.log("aran")
                        axios.put(`http://localhost:4000/game/${this.state.GameId}`, {black: this.state.username})
                        this.state.board.flip()
                    }
                }else if (gameData.white && gameData.black){
                    console.log("Game Full")
                    if (this.state.username !== gameData.white && this.state.username !== gameData.black) {
                        this.setState({
                            color: false,
                        })
                        document.getElementsByClassName('col').innerHTML = <div>This game is already full.</div>
                    }
                }else if (gameData.white){
                    if (this.state.username !== gameData.white) {
                        this.setState({
                            color: "black",
                            mymove: false,
                        })
                        console.log("aran")
                        axios.put(`http://localhost:4000/game/${this.state.GameId}`, {black: this.state.username})
                        this.state.board.flip()
                    }
                }else{
                    console.log("set to white")
                    if (this.state.username !== gameData.black) {
                        this.setState({
                            color: "white",
                        })
                        console.log("ran")
                        axios.put(`http://localhost:4000/game/${this.state.GameId}`, {white: this.state.username})
                    };
                }
                
                this.newMoves = setInterval(
                    () => this.getMovesAndUpdate(),
                    2000
                );

            });
            // allow board to resize with window
            await $(window).on('resize', this.state.board.resize);
        /*
        TODO
        
        //implement setinterval and clearinterval to fetch data and update board
        //implement game end checker
        */
    }

    async componentWillUnmount(){
        await clearInterval(this.newMoves);
    }

    getMovesAndUpdate = async () => {
        await axios.get(`http://localhost:4000/game/${this.state.GameId}`)
            .then((Response) => {
                if(this.state.color === "white"){
                    if(Response.data.bmoves.length!==this.state.bmoves.length){
                        const newMove = Response.data.bmoves[Response.data.bmoves.length-1];
                        this.setState(prevState => ({
                            bmoves: [...prevState.bmoves, newMove]
                        }))
                        const movedPiece = this.state.board.position()[newMove.split("-").at(0)].charAt(1); 
                        let gameMove = newMove.split("-").at(1)
                        if (movedPiece!=="P"){
                            gameMove = movedPiece + gameMove;
                        }
                        console.log(this.state.board.position()[newMove.split("-").at(0)].charAt(1));
                        this.state.game.move(gameMove);
                        this.state.board.position(this.state.game.fen())
                        if (this.state.mymove===false){
                            this.setState({
                                mymove: true,
                            })
                        }
                    }
                }else{
                    if(Response.data.wmoves.length!==this.state.wmoves.length){
                        const newMove = Response.data.wmoves[Response.data.wmoves.length-1]
                        this.setState(prevState => ({
                            wmoves: [...prevState.wmoves, newMove]
                        }))
                        const movedPiece = this.state.board.position()[newMove.split("-").at(0)].charAt(1); 
                        let gameMove = newMove.split("-").at(1)
                        if (movedPiece!=="P"){
                            gameMove = movedPiece + gameMove;
                        }
                        console.log(this.state.board.position()[newMove.split("-").at(0)].charAt(1));
                        //need to convert newMove, which is in form of source-target, to standard algebraic notation
                        this.state.game.move(gameMove);
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