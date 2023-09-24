"use client";
import React, { useContext, useEffect, useRef, useState } from "react";
import { MessageList, Navbar } from "react-chat-elements";
// import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import { Input } from "react-chat-elements";

import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { v4 as uuid } from "uuid";
import styles from "./styles.module.css";
import moment from "moment";
import "react-chat-elements/dist/main.css";
import Button from "@mui/material/Button";
// import LoadingState from "../../../../common/Loader";

// import Send from "../../../../resources/Send_Up_Right.png";

function Conversation() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [maxlength, setMaxLength] = useState(false);
  const [loading, setLoading] = useState(false);
  let inputRef = useRef();
  let messageContainerRef = useRef();
  const messagesEndRef = useRef(null);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [conversation_id, setConversation_id] = useState(null);
  const [chatUser, setChatUser] = useState(null);

  useEffect(() => {
    let user = localStorage.getItem("fireUserDetails");
    let currUser = localStorage.getItem("user");
    let stateInfo = localStorage.getItem("chatInfo")
      ? JSON.parse(localStorage.getItem("chatInfo"))
      : "";
    setConversation_id(stateInfo?.conversation_id);
    setChatUser(stateInfo?.chatUser);
    setCurrentUser(JSON.parse(user));
    setCurrentUserDetails(JSON.parse(currUser));
    // markChatRead();
    scrollToBottom();
    // return () => markChatRead();
  }, [conversation_id, JSON.stringify(messages)]);

  useEffect(() => {
    let stateInfo = localStorage.getItem("chatInfo")
      ? JSON.parse(localStorage.getItem("chatInfo"))
      : "";
    const unsubscribe = onSnapshot(
      doc(db, "chats", stateInfo?.conversation_id),
      (doc) => {
        const { messages } = doc.data();
        setMessages(messages);
      },
      (error) => {
        ToastMessage({
          type: "error",
          message: defaultMessage,
        });
        console.log("error", error);
      }
    );
    return () => unsubscribe();
  }, []);

  const markChatRead = async () => {
    await updateDoc(doc(db, "userChats", currentUser?.uid), {
      [conversation_id + ".isNew"]: false,
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: !loading ? "instant" : "smooth",
    });
  };

  const handleSend = async () => {
    if (text?.trim() === "") {
      return;
    }
    inputRef.current.value = "";
    inputRef.current.style = "height: 33px";
    setLoading(true);
    try {
      await updateDoc(doc(db, "chats", conversation_id), {
        messages: arrayUnion({
          id: uuid(),
          text,
          senderId: currentUser.uid,
          senderName: currentUserDetails?.displayName,
          receiverName: chatUser.name,
          date: Timestamp.now(),
        }),
      });
      await updateDoc(doc(db, "userChats", currentUser.uid), {
        [conversation_id + ".lastMessage"]: {
          text,
        },
        [conversation_id + ".date"]: serverTimestamp(),
      });

      await updateDoc(doc(db, "userChats", chatUser.uid), {
        [conversation_id + ".lastMessage"]: {
          text,
        },
        [conversation_id + ".date"]: serverTimestamp(),
        [conversation_id + ".isNew"]: true,
      });
    } catch (err) {
      alert(err);
    }

    setText("");
    setLoading(false);
  };

  const formateData = (data) => {
    const val = data.map((message) => {
      return {
        position: currentUser.uid === message.senderId ? "right" : "left",
        type: "text",
        text: message.text,
        date: moment(message.date.toDate()).format("MMMM DD, h:mm A"),
        dateString: moment(message.date.toDate()).format("MMM DD, h:mm A"),
      };
    });
    return val;
  };

  return (
    <>
      <Navbar
        left={
          <div
            onClick={() => {
              navigate("/chat");
              markChatRead();
            }}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div className="pt-1">{chatUser?.name}</div>
          </div>
        }
        type="light"
      />

      <div className="chat-bg">
        <div style={{ padding: "10px 0px 0px 0px" }}>
          {messages && messages.length > 0 && (
            <>
              <MessageList
                className="message-list"
                referance={messageContainerRef}
                dataSource={formateData(messages)}
              />
            </>
          )}
          <div ref={messagesEndRef} style={{ width: 5, height: 15 }}></div>
        </div>
      </div>
      <div className="row m-4">
        <div className="col-10 input-container-chat-main">
          <Input
            placeholder="Message"
            multiline={true}
            referance={inputRef}
            maxHeight={55}
            minHeight={36}
            onChange={(e) => {
              setText(e.target.value);
            }}
            rightButtons={
              <Button
                variant="contained"
                onClick={loading ? () => {} : handleSend}
              >
                send
              </Button>
            }
          />
        </div>
      </div>
    </>
  );
}

export default Conversation;
