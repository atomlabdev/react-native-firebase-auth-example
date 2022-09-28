import React, { useState } from "react";
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";

import { auth } from "./firebase";

function LoggedIn() {
  const logout = async () => {
    try {
      await signOut(auth);
    } catch(e) {
      console.error(e);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Logged in</Text>
      <Button title="Log out" onPress={logout} />
    </View>
  )
}

function Signup({ setScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);

  const createAccount = async () => {
    try {
      if (password === confirmPassword) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        setError("Passwords don't match");
      }
    } catch(e) {
      setError("There was a problem creating your account");
    }
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <Text style={styles.header}>Signup</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity onPress={() => setScreen("login")}>
          <Text style={styles.link}>Login to existing account</Text>
        </TouchableOpacity>

        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter email address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Confirm password"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <Button title="Create Account" onPress={createAccount} disabled={!email || !password || !confirmPassword} />
      </View>
    </View>
  )
}

function Login({ setScreen }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const loginUser = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch(error) {
      if (
        error.code === "auth/invalid-email" ||
        error.code === "auth/wrong-password"
      ) {
        setError("Your email or password was incorrect");
      } else if (error.code === "auth/email-already-in-use") {
        setError("An account with this email already exists");
      } else {
        setError("There was a problem with your request");
      }
    }
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <Text style={styles.header}>Login</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity onPress={() => setScreen("signup")}>
          <Text style={styles.link}>Create an account</Text>
        </TouchableOpacity>

        <TextInput
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          placeholder="Enter email address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Enter password"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          style={styles.input}
        />

        <TouchableOpacity onPress={() => setScreen("reset-password")}>
          <Text style={[styles.link, { color: "#333" }]}>I've forgotten my password</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={loginUser} disabled={!email || !password} />
      </View>
    </View>
  )
}

function ResetPassword({ setScreen }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const resetUserPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
      setError(null);
    } catch(error) {
      if (error.code === "auth/user-not-found") {
        setError("User not found");
      } else {
        setError("There was a problem with your request")
      }
    }
  }

  return (
    <View style={styles.outer}>
      <View style={styles.inner}>
        <Text style={styles.header}>Reset Password</Text>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity onPress={() => setScreen("login")}>
          <Text style={styles.link}>Back to login</Text>
        </TouchableOpacity>

        {
          submitted ? (
            <Text>Please check your email for a reset password link.</Text>
          ) : (
            <>
              <TextInput
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Enter email address"
                autoCapitalize="none"
                placeholderTextColor="#aaa"
                style={styles.input}
              />

              <Button title="Reset Password" onPress={resetUserPassword} disabled={!email} />
            </>
          )
        }
      </View>
    </View>
  );
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [screen, setScreen] = useState(null);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  })

  const getScreen = () => {
    if (loggedIn) return <LoggedIn />;
    if (screen === "signup") return <Signup setScreen={setScreen} />;
    if (screen === "reset-password") return <ResetPassword setScreen={setScreen} />;
    return <Login setScreen={setScreen} />;
  }
  
  return (
    <View style={{ flex: 1 }}>
      {getScreen()}
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  inner: {
    width: 240,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  error: {
    marginBottom: 20,
    color: 'red'
  },
  link: {
    color: 'blue',
    marginBottom: 20
  }
});