import React, {Component, createRef} from 'react';
import axios from 'axios';
//import PlayerList from './PlayerList';
class PlayerLogin extends Component {
    username = null;
    email = null;
    password = null;
    constructor(props){
        super(props);
        this.username = createRef();
        this.password = createRef();
    }
    submitPlayer = async (e) => {
        e.preventDefault();
        const loginAttempt = {
            username: this.username.current.value,
            password: this.password.current.value,
        }
        try {
            console.log(`http://localhost:4000/login/${loginAttempt.username}`)
            let res = await axios.get(`http://localhost:4000/login/${loginAttempt.username}`)
            console.log("hapepned")
            console.log(res)
            if (res.data.password === loginAttempt.password){
                console.log("same")
                this.props.login({
                    username: loginAttempt.username
                })
            }
        }catch(err){
            console.log(err);
        }
    }
    render() { 
        return ( 
            <div className="row">
                <form className="col s12" onSubmit={this.submitPlayer.bind(this)}>
                    <div className="row">
                        <div className="input-field col s10 push-s1 z-depth-3">
                            <input ref={this.username} id="lusername" type="text" className="white-text" />
                            <label htmlFor="username" className='white-text'>Username</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s10 push-s1 z-depth-3">
                            <input ref={this.password} id="lpassword" type="password" className='white-text' />
                            <label htmlFor="password" className='white-text'>Password</label>
                        </div>
                    </div>
                    <button className="btn waves-effect waves-light" type="submit" name="action">Login</button>
                </form>
            </div>
        );
    }
}
 
export default PlayerLogin;