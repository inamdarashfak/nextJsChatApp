"use client";
import React, { useEffect, useState } from "react";
import { ChatItem } from "react-chat-elements";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import LoadingState from "../components/loader";
import moment from "moment";
import NoDataFound from "../components/noDataFound";
import { auth } from "../utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navbar } from "react-chat-elements";
import { useRouter } from "next/navigation";
import _ from "lodash";
import Link from "@/node_modules/next/link";
import "react-chat-elements/dist/main.css";
import { signOut } from "firebase/auth";

export default function ConversationList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState({});
  const router = useRouter();
  const [currentUserDetails, setCurrentUserDetails] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      if (user) {
        getDoc(doc(db, "users", user?.uid))
          .then((res) => {
            setCurrentUserDetails(res.data());
            localStorage.setItem("fireUserDetails", JSON.stringify(res.data()));
          })
          .catch((err) => {
            console.log("err", err);
          });
      }
    });

    return () => {
      unsub();
    };
  }, [currentUser]);

  useEffect(() => {
    currentUser?.uid && getChats();
  }, [currentUser?.uid]);

  const getChats = async () => {
    const unsub = await onSnapshot(
      doc(db, "userChats", currentUser.uid),
      (doc) => {
        setChats(doc.data());
        setLoading(false);
      },
      (error) => {
        ToastMessage({
          type: "error",
          message: defaultMessage,
        });
        console.log("error", error);
      }
    );
  };
  const handlelogOut = () => {
    signOut(auth)
      .then(() => {
        localStorage.clear();
        router.push("/login");
      })
      .catch((error) => {
        // An error happened.
      });
  };

  return (
    <div style={{ marginTop: 65 }}>
      <div>
        <Navbar
          center={<div>Chats</div>}
          left={<div onClick={() => handlelogOut()}>Logout</div>}
          right={
            <Link href="/newconversation" style={{ fontSize: 30 }}>
              +
            </Link>
          }
          type="light"
        />
        <div>
          {chats && (
            <>
              {Object.entries(chats)
                ?.sort((a, b) => b[1].date - a[1].date)
                .map((chat, index) => (
                  <div key={index}>
                    {chat[1].lastMessage && (
                      <div
                        className="userChat"
                        key={index}
                        // onClick={() => handleSelect(chat[1].userInfo)}
                      >
                        <ChatItem
                          avatar={
                            chat[1].userInfo?.profilePhoto
                              ? chat[1].userInfo?.profilePhoto
                              : `https://ui-avatars.com/api/?name=${chat[1].userInfo.name[0]}`
                          }
                          alt={chat[1].userInfo.name[0]}
                          title={
                            <div>
                              <div className="chat-name">
                                {chat[1].userInfo.name}
                              </div>
                            </div>
                          }
                          subtitle={chat[1].lastMessage.text}
                          date={moment(chat[1].date.toDate()).format(
                            "YYYY-MM-DD HH:mm:ss"
                          )}
                          dateString={moment(chat[1].date.toDate()).format(
                            "MMM DD, h:mm A"
                          )}
                          unread={chat[1]?.isNew ? true : false}
                          onClick={() => {
                            let obj = {
                              conversation_id: chat[1].chat_id,
                              chatUser: chat[1].userInfo,
                            };
                            localStorage.setItem(
                              "chatInfo",
                              JSON.stringify(obj)
                            );
                            router.push("/conversations");
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      </div>

      {_.isEmpty(chats) && !loading && (
        <div>
          <NoDataFound title={"no chats found"} />
        </div>
      )}
      {loading && (
        <div
          style={{ marginTop: 50, display: "flex", justifyContent: "center" }}
        >
          <LoadingState color={"blue"} />
        </div>
      )}
    </div>
  );
}
