import React, {Component, createRef} from 'react';
import axios from 'axios';
//import PlayerList from './PlayerList';
class PlayerRegister extends Component {
    username = null;
    email = null;
    password = null;
    constructor(props){
        super(props);
        this.username = createRef();
        this.password = createRef();
        this.email = createRef();
    }
    submitPlayer = async (e) => {
        e.preventDefault();
        const newPerson = {
            username: this.username.current.value,
            password: this.password.current.value,
            email: this.email.current.value,
        }
        try {
            let res = await axios.post('http://localhost:4000/players', newPerson)
            console.log(res);
        }catch(err){
            console.log(err);
        }
        this.props.updateList();
    }
    render() { 
        return ( 
            <div className="row">
                <form className="col s12" onSubmit={this.submitPlayer.bind(this)}>
                    <div className="row">
                        <div className="input-field col s10 push-s1 z-depth-3">
                            <input ref={this.username} id="rusername" type="text" className="white-text" />
                            <label htmlFor="username" className='white-text'>Username</label>
                        </div>
                    </div>
                    <div className="row">
                        <div className="input-field col s10 push-s1 z-depth-3">
                            <input ref={this.password} id="rpassword" type="text" className='white-text' />
                            <label htmlFor="password" className='white-text'>Password</label>
                        </div>
                    </div>
                    <div className='row'>
                        <div className="input-field col s10 push-s1 z-depth-3">
                            <input ref={this.email} id="email" type="email" className="validate white-text" />
                            <label htmlFor="email" className='white-text'>Email</label>
                            <span className="helper-text" data-error="Make sure email is properly formatted" data-success="Properly Formatted!"></span>
                        </div>
                    </div>
                    <button className="btn waves-effect waves-light" type="submit" name="action">Register</button>
                </form>
            </div>
        );
    }
}
 
export default PlayerRegister;