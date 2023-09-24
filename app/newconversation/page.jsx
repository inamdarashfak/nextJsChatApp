"use client";
import React, { useEffect, useState, useRef } from "react";
import { ChatItem, Navbar } from "react-chat-elements";
import { db } from "../utils/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
  getDoc,
  orderBy,
} from "firebase/firestore";
import NoDataFound from "../components/noDataFound";
import LoadingState from "../components/loader";
import "react-chat-elements/dist/main.css";
import { useRouter } from "next/navigation";

export default function NewConversation() {
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [err, setErr] = useState(false);
  const [lastKey, setLastKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [backDropLoader, setBackDropLoader] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const observer = useRef();

  useEffect(() => {
    let user = localStorage.getItem("fireUserDetails");
    let currUser = localStorage.getItem("user");
    setCurrentUser(JSON.parse(user));
    setCurrentUserDetails(JSON.parse(currUser));
    fetchUser();
  }, []);

  const handleSelect = async (user) => {
    console.log("user", user);
    setBackDropLoader(true);
    //check whether the group(chats in firestore) exists, if not create
    const combinedId =
      currentUser.uid > user.uid
        ? currentUser.uid + user.uid
        : user.uid + currentUser.uid;
    try {
      const res = await getDoc(doc(db, "chats", combinedId));
      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "chats", combinedId), { messages: [] });
        const checkChatListExitCurrentUser = await getDoc(
          doc(db, "userChats", currentUser.uid)
        );
        const checkChatListExitReceiver = await getDoc(
          doc(db, "userChats", user.uid)
        );
        if (!checkChatListExitCurrentUser.exists()) {
          await setDoc(doc(db, "userChats", currentUser.uid), {});
        }
        if (!checkChatListExitReceiver.exists()) {
          await setDoc(doc(db, "userChats", user.uid), {});
        }
        //create user chats
        await updateDoc(doc(db, "userChats", currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,

            name: user?.name,
            profilePhoto: user?.profilePhoto || "",
          },
          [combinedId + ".chat_id"]: combinedId,
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser.uid,

            name: currentUserDetails?.displayName,
            profilePhoto: currentUserDetails?.photoURL || "",
          },
          [combinedId + ".chat_id"]: combinedId,
          [combinedId + ".date"]: serverTimestamp(),
        });
        let obj = {
          conversation_id: res.id,
          messages: res.data(),
          chatUser: user,
        };
        localStorage.setItem("chatInfo", JSON.stringify(obj));
        router.push("/conversations");
      } else {
        let obj = {
          conversation_id: res.id,
          messages: res.data(),
          chatUser: user,
        };
        localStorage.setItem("chatInfo", JSON.stringify(obj));
        router.push("/conversations");
      }
    } catch (err) {
      console.error(err);
      setBackDropLoader(false);
    }

    setUser(null);
    setUsername("");
  };

  const fetchUser = async () => {
    setLoading(true);
    let firebaseUsers = [];
    let LastKey = "";
    const q = query(collection(db, "users"), orderBy("name", "asc"));
    getDocs(q)
      .then((res) => {
        res.forEach((doc) => {
          firebaseUsers.push(doc.data());
          LastKey = doc.data().userName;
        });
        setLastKey(LastKey);
        setUsers(firebaseUsers);
        setLoading(false);
        // getCurrentFireBaseUser();
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  return (
    <div>
      <Navbar
        center={<div className="pt-1">New Chat</div>}
        left={
          <div
            onClick={() => {
              navigate("/chat");
            }}
          ></div>
        }
        type="light"
      />

      <div className="container" style={{ marginTop: 70 }}>
        {users && users.length > 0 && (
          <>
            {users.map((user, index) => (
              <div key={user?.uid}>
                <ChatItem
                  avatar={
                    user?.profilePhoto
                      ? user?.profilePhoto
                      : `https://ui-avatars.com/api/?name=${user?.name[0]}`
                  }
                  alt="kursat_avatar"
                  title={
                    <div>
                      <div className="chat-name">{user?.name}</div>
                    </div>
                  }
                  date={null}
                  onClick={() => {
                    handleSelect(user);
                  }}
                />
              </div>
            ))}
          </>
        )}
        {loading && (
          <div
            style={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <LoadingState color={"blue"} />
          </div>
        )}

        {users && users?.length === 0 && !loading && (
          <NoDataFound title={"No user found"} />
        )}

        {backDropLoader && (
          <div className="backdrop-loader">
            <LoadingState width="50px" height="50px" color={"blue"} />
          </div>
        )}
      </div>
    </div>
  );
}
