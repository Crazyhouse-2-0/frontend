import React from 'react';
import * as Colyseus from 'colyseus.js';
export default function ColyseusTesting() {

    var host = window.document.location.host.replace(/:.*/, '');

    var client = new Colyseus.Client(window.document.location.protocol.replace("http", "ws") + "//" + host + (window.document.location.port ? ':' + window.document.location.port : ''));
    var room;
    client.joinOrCreate("state_handler").then(room_instance => {
        room = room_instance

        var players = {};
        var colors = ['red', 'green', 'yellow', 'blue', 'cyan', 'magenta'];

        // listen to patches coming from the server
        room.state.players.onAdd = function (player, sessionId) {
            var dom = document.createElement("div");
            dom.className = "player";
            dom.style.left = player.x + "px";
            dom.style.top = player.y + "px";
            dom.style.background = colors[Math.floor(Math.random() * colors.length)];
            dom.innerText = "Player " + sessionId;

            player.onChange = function (changes) {
                dom.style.left = player.x + "px";
                dom.style.top = player.y + "px";
            }

            players[sessionId] = dom;
            document.body.appendChild(dom);
        }

        room.state.players.onRemove = function (player, sessionId) {
            document.body.removeChild(players[sessionId]);
            delete players[sessionId];
        }

        
        room.onMessage("hello", (message) => {
            console.log(message);
        });

        window.addEventListener("keydown", function (e) {
            if (e.which === 38) {
                up();

            } else if (e.which === 39) {
                right();

            } else if (e.which === 40) {
                down();

            } else if (e.which === 37) {
                left();
            }
        });

    });

    function up () {
        room.send("move", { y: -1 });
    }

    function right () {
        room.send("move", { x: 1 });
    }

    function down () {
        room.send("move", { y: 1 })
    }

    function left () {
        room.send("move", { x: -1 })
    }

    
    return (
        <div>
        <p>This example shows how to use custom data structures in your room's state.</p>

        <strong>commands</strong><br/>

        <button onclick="up()">up</button>
        <button onclick="down()">down</button>
        <br />
        <button onclick="left()">left</button>
        <button onclick="right()">right</button>
        </div>
   )
}