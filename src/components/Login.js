import React from "react";
import "../css/Login.css";
import { Button } from "@material-ui/core";
import { auth, provider } from "../firebase";
import { useStateValue } from "../StateProvider";
import { actionTypes } from "../reducer";

import db from "../firebase";

function Login() {
  const [{ user }, dispatch] = useStateValue();
  const signIn = () => {
    auth
      .signInWithPopup(provider)
      .then((result) => {
        dispatch({
          type: actionTypes.SET_USER,
          user: result.user,
        });

        db.collection("users")
          .where("email", "==", result.user.email)
          .get()
          .then((snap) => {
            if (snap.empty) {
              db.collection("users").add({
                email: result.user.email,
                name: result.user.displayName.toLowerCase(),
                pic: result.user.photoURL,
                friends: [],
              });
            }
          });
      })
      .catch((error) => alert(error.message));
  };
  return (
    <div className="login">
      <div className="login__container">
        {/* <img src="/images/logoo.gif" alt="not found" /> */}
        <img
          style={{ borderRadius: "50%" }}
          src="/images/chat-gif1.gif"
          alt=""
        />
        {/* <iframe
          src="https://my.spline.design/iconcloud-ddba8052462e3b5317d7158fa5fa6ac8/"
          frameborder="0"
        ></iframe> */}
        <div className="login__text">
          <h1> How ya doin'</h1>
        </div>

        <Button type="submit" onClick={signIn}>
          Sign In With Google
        </Button>
      </div>
    </div>
  );
}

export default Login;
