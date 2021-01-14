import React, { useState, useEffect } from "react";
import "../css/Sidebar.css";
import { useHistory } from "react-router-dom";
import DonutLargeIcon from "@material-ui/icons/DonutLarge";
import ChatIcon from "@material-ui/icons/Chat";
import { Avatar, IconButton } from "@material-ui/core";
import SearchOutlinedIcon from "@material-ui/icons/SearchOutlined";
import SidebarChat from "./SidebarChat";
import db from "../firebase";
import { useStateValue } from "../StateProvider";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import { actionTypes } from "../reducer";
import { auth } from "../firebase";
import AddCircleOutlineRoundedIcon from "@material-ui/icons/AddCircleOutlineRounded";
import Invite from "./Invite";
import CachedIcon from "@material-ui/icons/Cached";

function Sidebar() {
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const [searches, setSearches] = useState([]);
  const [searchess, setSearchess] = useState([]);
  const history = useHistory();

  const [handleToggle, setHandleToggle] = useState(false);
  const [invite, setInvite] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  function handleClick() {
    history.push("/invite");
  }

  useEffect(() => {
    const unsubscribe = db.collection("rooms").onSnapshot((snapshot) => {
      setRooms(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const unsubscribe = db.collection("users").onSnapshot((snapshot) => {
      setUsers(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }))
      );
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const createChat = () => {
    const roomName = prompt("Please enter name for chat");
    if (roomName) {
      db.collection("rooms").add({
        name: roomName.toLowerCase(),
      });
    }
  };

  const signOut = () => {
    auth.signOut().then(() => {
      dispatch({
        type: actionTypes.LOGOUT_USER,
      });
    });
  };

  const fetchRooms = (e) => {
    console.log("searching ", e.target.value);
    db.collection("rooms")
      .where("name", ">=", e.target.value.toLowerCase())
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
  };

  const fetchUsers = (e) => {
    console.log("searching ", e.target.value);
    db.collection("users")
      .where("name", ">=", e.target.value.toLowerCase())
      .get()
      .then((snapshot) => {
        let users = snapshot.docs.map((doc) => {
          console.log({ doc });
          const data = doc.data();
          const id = doc.id;
          return { id, ...data };
        });
        setSearchess(users);
      });
  };

  console.log(searchess);

  return (
    <div className="sidebar">
      <div className="sidebar__header">
        <Avatar src={user?.photoURL} />
        <h4 className="sidebar__username">{user?.displayName}</h4>
        <div className="sidebar__headerRight">
          <IconButton>
            <CachedIcon onClick={() => setHandleToggle(!handleToggle)} />
          </IconButton>

          <IconButton>
            <AddCircleOutlineRoundedIcon onClick={() => setInvite(!invite)} />
          </IconButton>

          <IconButton onClick={createChat}>
            <ChatIcon />
          </IconButton>
          <IconButton onClick={signOut}>
            <PowerSettingsNewIcon />
          </IconButton>
        </div>
      </div>
      <div className="sidebar__search">
        <div className="sidebar__searchContainer">
          <SearchOutlinedIcon />
          {invite === true ? (
            <input
              type="text"
              placeholder="Search for a  chat"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          ) : handleToggle === false ? (
            <input
              type="text"
              placeholder="Search for a  chat"
              onChange={(e) => fetchRooms(e)}
            />
          ) : (
            <input
              type="text"
              placeholder="Search for a  chat"
              onChange={(e) => fetchUsers(e)}
            />
          )}
        </div>
      </div>
      {invite === true ? (
        <Invite search={searchUser} />
      ) : handleToggle === false ? (
        <div className="sidebar__chats">
          {searches.length === 0
            ? rooms.map((room) => (
                <SidebarChat
                  key={room.id}
                  id={room.id}
                  name={room.data?.name ? room.data.name : null}
                />
              ))
            : searches.map((room) => (
                <SidebarChat
                  key={room.id}
                  id={room.id}
                  name={room.name ? room.name : null}
                />
              ))}
        </div>
      ) : (
        <div className="sidebar__chats">
          {searchess.length === 0
            ? users.map(
                (userss) =>
                  userss.name !== user?.displayName && (
                    <SidebarChat
                      key={userss.id}
                      id={userss.id}
                      name={userss.data?.name ? userss.data.name : null}
                      type="user"
                      picture={userss.data?.pic}
                    />
                  )
              )
            : searchess.map(
                (userss) =>
                  userss.name !== user?.displayName && (
                    <SidebarChat
                      key={userss.id}
                      id={userss.id}
                      name={userss.name ? userss.name : null}
                      type="user"
                      picture={userss.pic}
                    />
                  )
              )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
