import React from 'react';

class LogoutButton extends React.Component {
    render () {
        return (
            <div>
                <a className="waves-effect waves-light btn" href="#!" onClick={this.props.logout}>Logged in as {this.props.username} | Logout</a>
            </div>
        )
    }
}

export default LogoutButton;