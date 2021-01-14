import React, { useState, useEffect } from "react";
import db from "../firebase";
import SidebarChat from "./SidebarChat";
import { useStateValue } from "../StateProvider";
import { Avatar, IconButton } from "@material-ui/core";
import PersonAddIcon from "@material-ui/icons/PersonAdd";

import firebase from "firebase";

function Invite({ search }) {
  const [{ user }, dispatch] = useStateValue();
  const [users, setUsers] = useState([]);
  const [searches, setSearches] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  console.log({ user, searches, users });

  useEffect(() => {
    console.log("searching ", search);
    db.collection("users")
      .where("name", ">=", search.toLowerCase())
      .get()
      .then((snapshot) => {
        let users = snapshot.docs.map((doc) => {
          console.log({ doc });
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        setSearches(users);
      });

    db.collection("users")
      .where("email", "==", user.email)
      .get()
      .then((snap) =>
        snap.docs.map((doc) => {
          setCurrentUserId(doc.id);
        })
      );
  }, [search]);

  const addFriend = (userr) => {
    db.collection("users")
      .doc(currentUserId)
      .update({
        friends: firebase.firestore.FieldValue.arrayUnion(userr.id),
      });
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div className="sidebar__chats">
        {searches.length === 0
          ? users.map((userss) => (
              <div className="sidebarChat">
                <Avatar src={userss.pic} />
                <div className="sidebarChat__info">
                  <h2 style={{ textTransform: "capitalize" }}>
                    {userss.name ? userss.name : null}
                  </h2>
                </div>
                <IconButton onClick={() => addFriend(userss)}>
                  <PersonAddIcon />
                </IconButton>
              </div>
            ))
          : searches.map((userss) => (
              <div className="sidebarChat">
                <Avatar src={userss.pic} />
                <div className="sidebarChat__info">
                  <h2 style={{ textTransform: "capitalize" }}>
                    {userss.name ? userss.name : null}
                  </h2>
                </div>
                <IconButton onClick={() => addFriend(userss)}>
                  <PersonAddIcon />
                </IconButton>
              </div>
            ))}
      </div>
    </div>
  );
}

export default Invite;
