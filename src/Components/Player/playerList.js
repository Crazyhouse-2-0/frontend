import React from 'react';

const PlayerList = (props) => {
    props.players.sort( (a,b) => {
        return b.rating - a.rating;
    })
    return (
        <div>
             <ul className="collection with-header">
                 <li className='collection-header'><h4>Players</h4></li>
                {props.players.map((player) => 
                    <li className="collection-item avatar" key={player._id}>
                    <img src="/defaultuser.jpg" alt="default user icon" className="circle"/>
                    <span className="title"><strong>{player.username}</strong></span>
                    <p>{player.rating}</p>
                    <a href="#!" className="secondary-content">Details</a>
                    </li>
                )}
            </ul>
        </div>
    )
}

export default PlayerList;