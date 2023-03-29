import React from "react";
import Container from "@mui/material/Container";
import "./App.css";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuestionForm } from "./components/QA";
import Login from "./components/Login";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import { Navbar } from "./components/Navbar";

function App() {
  return (
    <Container maxWidth="xl" sx={{ p: "0px !important" }}>
      <Navbar></Navbar>
      <UserAuthContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/home" element={<QuestionForm />} />
            <Route path="/" element={<Login />} />
            {/* <Route path="/signup" element={<Signup />} /> */}
          </Routes>
        </BrowserRouter>
      </UserAuthContextProvider>
    </Container>
  );
}

export default App;
