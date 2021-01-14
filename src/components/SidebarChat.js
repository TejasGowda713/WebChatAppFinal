import React, { useState, useEffect } from "react";
import "../css/SidebarChat.css";
import { Avatar, IconButton } from "@material-ui/core";
import db from "../firebase";
import Login from "./Login";
import { Link } from "react-router-dom";

function SidebarChat({ addNewChat, id, name, text, type, picture }) {
  const [seed, setSeed] = useState("");
  const [messages, setMessages] = useState("");

  useEffect(() => {
    if (type === "user") {
      if (id) {
        db.collection("users")
          .doc(id)
          .collection("messages")
          .orderBy("timestamp", "desc")
          .onSnapshot((snapshot) =>
            setMessages(snapshot.docs.map((doc) => doc.data()))
          );
      }
    } else {
      if (id) {
        db.collection("rooms")
          .doc(id)
          .collection("messages")
          .orderBy("timestamp", "desc")
          .onSnapshot((snapshot) =>
            setMessages(snapshot.docs.map((doc) => doc.data()))
          );
      }
    }
  }, []);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
  }, []);

  return (
    <div>
      {type === "user" ? (
        <Link to={`/users/${id}`}>
          <div className="sidebarChat">
            <Avatar src={picture} />
            <div className="sidebarChat__info">
              <h2 style={{ textTransform: "capitalize" }}>
                {name ? name : null}
              </h2>
              <p>{messages[0]?.message}</p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="sidebarChat__container">
          <Link className="sidebarChat" to={`/rooms/${id}`}>
            <Avatar
              src={`https://avatars.dicebear.com/api/human/${seed}.svg`}
            />

            <div className="sidebarChat__info">
              <h2 style={{ textTransform: "capitalize" }}>
                {name ? name : null}
              </h2>
              <p>{messages[0]?.message}</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

export default SidebarChat;
