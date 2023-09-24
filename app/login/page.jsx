"use client";
import React, { useState } from "react";
import { auth, db } from "../utils/firebase";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [formType, setFormType] = useState({
    login: false,
    signup: false,
  });

  const createFirebaseUser = async () => {
    const fullName = formData.name;
    const email = formData.email;
    const password = formData.password;
    const createdAt = Date.now();
    if (!fullName || !email || !password) {
      return;
    }
    try {
      //Create user
      const res = await createUserWithEmailAndPassword(auth, email, password);
      //Update profile
      await updateProfile(res.user, {
        displayName: fullName,
      });
      //create user on firestore
      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email,
        createdAt,
        name: fullName,
      });

      //create empty user chats on firestore
      await setDoc(doc(db, "userChats", res.user.uid), {});
      router.push("/conversationList");

      console.log("test");
    } catch (err) {
      console.log(err);
    }

    // handleSubmit();
  };

  const handleOnchange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  const firebaseLogin = async () => {
    const email = formData.email;
    const password = formData.password;
    if (!email || !password) {
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/conversationList");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {(!formType.signup || !formType.login) && (
        <div>
          <div
            style={{
              textAlign: "center",
              marginTop: "100px",
              fontSize: 30,
              paddingBottom: 30,
            }}
          >
            Chat App
          </div>
          <Stack spacing={2} direction="row" className="main">
            <Button
              variant="contained"
              onClick={() =>
                setFormType({ ...formType, login: true, signup: false })
              }
            >
              Login
            </Button>
            <Button
              variant="contained"
              onClick={() =>
                setFormType({ ...formType, signup: true, login: false })
              }
            >
              Signup
            </Button>
          </Stack>
        </div>
      )}

      {formType.login && (
        <div style={{ width: 235, margin: "0 auto" }}>
          <div style={{ padding: "30px 0px" }}>
            <TextField
              label="Email"
              variant="outlined"
              onChange={handleOnchange}
              name="email"
              value={formData.email}
              placeholder="Email"
              type={"email"}
            />
          </div>
          <div>
            <TextField
              label="Password"
              variant="outlined"
              onChange={handleOnchange}
              name="password"
              value={formData.password}
              placeholder={"Password"}
              type="password"
            />
          </div>
          <Button
            variant="contained"
            color="success"
            onClick={firebaseLogin}
            style={{ marginTop: 20 }}
          >
            Login
          </Button>
        </div>
      )}
      {formType.signup && (
        <div style={{ width: 235, margin: "0 auto" }}>
          <div style={{ padding: "30px 0px 0px 0px" }}>
            <TextField
              label="Name"
              variant="outlined"
              onChange={handleOnchange}
              name="name"
              value={formData.name}
              placeholder="Name"
              type={"text"}
            />
          </div>

          <div style={{ padding: "30px 0px" }}>
            <TextField
              label="Email"
              variant="outlined"
              onChange={handleOnchange}
              name="email"
              value={formData.email}
              placeholder="Email"
              type={"email"}
            />
          </div>
          <div>
            <TextField
              label="Password"
              variant="outlined"
              onChange={handleOnchange}
              name="password"
              value={formData.password}
              placeholder={"Password"}
              type="password"
            />
          </div>
          <Button
            variant="contained"
            color="success"
            onClick={createFirebaseUser}
            style={{ marginTop: 20 }}
          >
            SignUp
          </Button>
        </div>
      )}
    </>
  );
};

export default LoginPage;
