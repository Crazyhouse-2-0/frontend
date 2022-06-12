import React from 'react';
import axios from 'axios';

class CreateGame extends React.Component {
    constructor (props) {
        super(props);
        this.state = {
            url: ""
        }
    }

    generateNewGame = async () => {
        const newGame = {
            
        }

        try {
            let res = await axios.post('http://localhost:4000/games', newGame)
            console.log(res);
            console.log(res.data._id);
            this.setState({
                url: res.data._id
            })
        }catch(err) {
            console.log(err)
        }
    }

    render() { 
        
        return (  
            <div>
                <h4>
                    Create a Game Room
                </h4>
                {this.state.url ? `Go to ${window.location.href}`+this.state.url : ""}
                <button className='btn waves-effect waves-light' onClick={this.generateNewGame}>
                    Start a Game!
                </button>
            </div>
        );
    }
}


export default CreateGame;