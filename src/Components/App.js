import React from 'react';
//import {Helmet} from 'react-helmet';
import './App.css';
import axios from 'axios';
import PlayerList from './Player/playerList';
import LoginModal from './Login/LoginModal';
import LogoutButton from './Login/LogoutButton';
import CreateGame from './Game/CreateGame';

class App extends React.Component {
  constructor (props) {
    super(props);
    if (!localStorage.getItem('username')){
      this.state = {
        players: [],
        token: false,
        username: "",
      }
    }else{
      this.state = {
        players: [],
        token: localStorage.getItem('token'),
        username: localStorage.getItem('username').replace(/^"(.+)"$/,'$1'),
      }
    }
  }

  

  componentDidMount() {
    const url = 'http://localhost:4000/players';

    axios.get(url)
      .then((Response) => {
        this.setState({
          players: Response.data
        })
      })
      .catch((err) => {
        console.log(err)
      })
      if (document.getElementById('todelete') == null){
        console.log("ran")
        const s = document.createElement('script');
        s.type = 'module'
        s.async = true;
        s.id = "todelete"
        s.src = "./chessboard.js"
        document.body.appendChild(s);
      }
  }

  updateList = () => {
    const url = 'http://localhost:4000/players';
    axios.get(url)
      .then((Response) => {
        this.setState({
          players: Response.data
        })
      })
    console.log("ran")
  }

  login = (result) => {
    console.log("smthg")
    this.setState({
      username: result.username,
      token:true,
    })
    this.setToken({
      token: true, 
      username: result.username
    });
  }
  logout = () => {
    this.setState({
      username:"",
      token:false,
    })
    localStorage.removeItem("username");
    localStorage.removeItem("token");
  }
  setToken = (userToken) => {
    localStorage.setItem('token', JSON.stringify(userToken.token));
    localStorage.setItem('username', JSON.stringify(userToken.username))
  }

  getToken = () => {
    const tokenString = localStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    return userToken?.token
  }

  render() {
    //const token = this.getToken();

    let button;
    if (!this.state.token) {
      button = <LoginModal updateList={this.updateList} login={this.login}/>
    }else{
      button = <LogoutButton username={this.state.username} logout={this.logout}/>
    }
    return (
      <div className="container-fluid">
        <div className='row'>
          <nav>
            <div className="nav-wrapper blue darken-3">
              <a href="/" className="brand-logo">InsaneHouse</a>
              <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li>
                  {button}
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <div className='row'>
          <div className='col s3'>
            <PlayerList players={this.state.players}/>
          </div> 
          <div className='col s2'>
            <CreateGame username={this.state.username}/>
          </div>
          <div className='col s5 push-s2'>
            <div id="board" style={{width:"80%"}}></div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
