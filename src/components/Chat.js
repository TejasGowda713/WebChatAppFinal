import React, { useState, useEffect, useRef } from "react";
import "../css/Chat.css";
import { Avatar, IconButton } from "@material-ui/core";
import {
  AttachFile,
  MoreVert,
  SearchOutlined,
  InsertEmoticon,
  // Mic,
} from "@material-ui/icons";
import { useParams } from "react-router-dom";
import db from "../firebase";
import { useStateValue } from "../StateProvider";
import firebase from "firebase";

import { storage } from "../firebase";
import DeleteIcon from "@material-ui/icons/Delete";
import InputEmoji from "react-input-emoji";
import ImageSearchIcon from "@material-ui/icons/ImageSearch";
import { Link, useHistory } from "react-router-dom";

// import MicRecorder from "mic-recorder-to-mp3";

function Chat() {
  const [seed, setSeed] = useState("");
  const [input, setInput] = useState("");
  const { roomId } = useParams();
  const history = useHistory();

  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([]);
  const [{ user }, dispatch] = useStateValue();
  const el = useRef(null);

  const [text, setText] = useState("");

  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [progress, setProgress] = useState(0);

  const [searchEnable, setSearchEnable] = useState(false);
  const [searches, setSearches] = useState([]);

  // const [audio, setAudio] = useState(null);

  useEffect(() => {
    el.current.scrollIntoView({ block: "end", behavior: "smooth" });
  });

  useEffect(() => {
    if (!roomId) {
      history.push("/");
    }
    if (roomId) {
      db.collection("rooms")
        .doc(roomId)
        .onSnapshot((snapshot) => setRoomName(snapshot.data().name));
      db.collection("rooms")
        .doc(roomId)
        .collection("messages")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) =>
          setMessages(snapshot.docs.map((doc) => doc.data()))
        );

      db.collection("rooms")
        .doc(roomId)
        .collection("images")
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) =>
          setImages(snapshot.docs.map((doc) => doc.data()))
        );
    }
  }, [roomId]);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 5000));
  }, []);

  const handleEnter = (text) => {
    db.collection("rooms").doc(roomId).collection("messages").add({
      message: text,
      name: user.displayName,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });

    setInput("");
    setText("");
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  console.log({ image });

  const handleUpload = (imageUrl) => {
    console.log("1");
    const uploadTask = storage.ref(`images/${imageUrl.name}`).put(imageUrl);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        //progress function
        const prog = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(prog);
      },
      (error) => {
        console.log(error.message);
        alert(error.message);
      },
      () => {
        storage
          .ref("images")
          .child(imageUrl.name)
          .getDownloadURL()
          .then((url) => {
            //post image inside db
            db.collection("rooms").doc(roomId).collection("messages").add({
              imageUrl: url,
              name: user.displayName,
              timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            });
            setImage(null);
          });
      }
    );
  };

  const fetchUsers = (e) => {
    db.collection("rooms")
      .doc(roomId)
      .collection("messages")
      .where("message", "==", e.target.value)
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

  const deleteRoom = () => {
    db.collection("rooms")
      .doc(roomId)
      .collection("messages")
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          doc.ref.delete();
        });
      });

    // db.collection("rooms")
    //   .doc(roomId)
    //   .delete()
    //   .then((res) => history.push("/"))
    //   .catch((err) => console.log(err));
  };

  return (
    <div className="chat">
      <div className="chat__header">
        <Avatar src={`https://avatars.dicebear.com/api/human/${seed}.svg`} />
        <div className="chat__headerInfo">
          <h3 style={{ textTransform: "capitalize" }}>{roomName}</h3>
          <p>
            {messages[messages.length - 1]
              ? new Date(
                  messages[messages.length - 1]?.timestamp?.toDate()
                ).toString()
              : null}
          </p>
        </div>

        <div className="chat__headerRight">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginRight: "20px",
            }}
          >
            <SearchOutlined
              style={{ color: "grey" }}
              onClick={() => setSearchEnable(!searchEnable)}
            />
            <input
              className={searchEnable ? "search__enabled" : "search__disabled"}
              type="text"
              placeholder="Search for a message"
              onChange={(e) => fetchUsers(e)}
            />
          </div>

          <div style={{ marginTop: "13px", color: "grey" }}>
            <label for="file-input">
              <ImageSearchIcon />
            </label>

            <input
              style={{ display: "none" }}
              id="file-input"
              type="file"
              onChange={(e) => handleChange(e)}
            />
          </div>

          <IconButton className="delete__icon" onClick={deleteRoom}>
            <DeleteIcon />
          </IconButton>

          {/* <IconButton>
            <MoreVert />
          </IconButton> */}
        </div>
      </div>
      <div className="chat__body">
        {searches.length === 0
          ? messages.map((message) =>
              message.message ? (
                <p
                  className={`chat__message ${
                    message.name === user.displayName && "chat__receiver"
                  }`}
                >
                  <span className="chat__name ">{message.name}</span>
                  {message.message ? message.message : message.imageUrl}
                  <span className="chat__timeStamp">
                    {new Date(message.timestamp?.toDate()).toLocaleString()}
                  </span>
                </p>
              ) : (
                <div
                  className={`chat__image ${
                    message.name === user.displayName && "chat__receiver"
                  }`}
                >
                  <span className="chat__imageName ">{message.name}</span>
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    src={message.imageUrl}
                    alt="Not found"
                  />
                  <span className="chat__imageTimeStamp">
                    {new Date(message.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
              )
            )
          : searches.map((message) =>
              message.message ? (
                <p
                  className={`chat__message ${
                    message.name === user.displayName && "chat__receiver"
                  }`}
                >
                  <span className="chat__name ">{message.name}</span>
                  {message.message ? message.message : message.imageUrl}
                  <span className="chat__timeStamp">
                    {new Date(message.timestamp?.toDate()).toLocaleString()}
                  </span>
                </p>
              ) : (
                <div
                  className={`chat__image ${
                    message.name === user.displayName && "chat__receiver"
                  }`}
                >
                  <span className="chat__imageName ">{message.name}</span>
                  <img
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                    src={message.imageUrl}
                    alt="Not found"
                  />
                  <span className="chat__imageTimeStamp">
                    {new Date(message.timestamp?.toDate()).toLocaleString()}
                  </span>
                </div>
              )
            )}

        <div id={"el"} ref={el}></div>
        {/* <div className="container text-center">
          <button className="btn btn-primary">Start recording</button>

          <div id="playlist">
            <audio
              id="aud"
              src={audio}
              controls="controls"
              autobuffer="autobuffer"
              autoplay="autoplay"
            ></audio>
          </div>
        </div> */}
      </div>
      <div className="chat__footer">
        <InputEmoji
          value={input}
          onChange={setInput}
          // onFocus={}
          cleanOnEnter
          onEnter={handleEnter}
          placeholder="Type a message"
        />

        {/* <Mic /> */}
      </div>
    </div>
  );
}

export default Chat;

// getInitialState: function(){
//   return {
//       peer: new Peer({key: this.props.opts.peerjs_key}),
//       my_id: '',
//       peer_id: '',
//       initialized: false,
//       files: []
//   }
// }
