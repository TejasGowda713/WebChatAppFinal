import React, { useEffect, useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import UserChat from "./components/UserChat";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Login from "./components/Login";
import { useStateValue } from "./StateProvider";
import DarkModeToggle from "react-dark-mode-toggle";
import Invite from "./components/Invite";
import { auth } from "./firebase";
import { actionTypes } from "./reducer";

function App() {
  const [{ user }, dispatch] = useStateValue();

  // useEffect(()=>{
  //   auth.onAuthStateChanged((authUser) =>{
  //     if(authUser){
  //       dispatch(actionTypes.user ({

  //       }))
  //     }
  //   })
  // },[])

  return (
    <div className="app">
      {user ? (
        <div className="app__body">
          <Router>
            <Sidebar />
            <Switch>
              <Route path="/rooms/:roomId">
                <Chat />
              </Route>
              <Route path="/users/:userId">
                <UserChat />
              </Route>
              <Route path="/invite" component={Invite} />
              <Route path="/"></Route>
            </Switch>
          </Router>
        </div>
      ) : (
        <Login />
      )}
    </div>
  );
}

export default App;
