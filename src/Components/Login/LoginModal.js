import React, { Component } from "react";
import M from "materialize-css";
import PlayerRegister from "../Player/playerRegister";
import PlayerLogin from "../Player/playerLogin";

class LoginModal extends Component {
  componentDidMount() {
    const options = {
      onOpenStart: () => {
        console.log("Open Start");
      },
      onOpenEnd: () => {
        console.log("Open End");
      },
      onCloseStart: () => {
        console.log("Close Start");
      },
      onCloseEnd: () => {
        console.log("Close End");
      },
      inDuration: 250,
      outDuration: 250,
      opacity: 0.5,
      dismissible: true,
      startingTop: "4%",
      endingTop: "10%"
    };
    M.Modal.init(this.Modal, options);
    // If you want to work on instance of the Modal then you can use the below code snippet 
    // let instance = M.Modal.getInstance(this.Modal);
    // instance.open();
    // instance.close();
    // instance.destroy();
  }

  render() {
    return (
      <>
        <a className="waves-effect waves-light btn modal-trigger" href="#modal1"> Login | Register</a>

        <div ref={Modal => {this.Modal = Modal;}} id="modal1" className="modal">
          {/* If you want Bottom Sheet Modal then add 
        bottom-sheet class */}
          <div className="modal-content blue container-fluid">
            <div className="row">
              <div id="signIn" className="col s6 center">
                <h3>Sign In</h3>
                <PlayerLogin login={this.props.login}/>
              </div>
              <div id="register" className="col s6 center container-fluid">
                <h3>Register</h3>
                <PlayerRegister updateList={this.props.updateList}/>
              </div>
            </div>
          </div>
          {/*
          <div class="modal-footer">
            <a href="#!" class="modal-close waves-effect waves-red btn-flat">
              Disagree
            </a>
            <a href="#!" class="modal-close waves-effect waves-green btn-flat">
              Agree
            </a>
          </div>
          */}
        </div>
      </>
    );
  }
}

export default LoginModal;