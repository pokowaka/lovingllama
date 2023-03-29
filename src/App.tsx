import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QuestionForm } from "./components/QA";
import { UserAuthContextProvider } from "./context/UserAuthContext";
import Container from "@mui/material/Container";
import Forgot from "./components/Forgot";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";

function App() {
  return (
    <Container maxWidth="xl" sx={{ p: "0px !important" }}>
      <UserAuthContextProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            <Route path="/home" element={<QuestionForm />} />
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
          </Routes>
        </BrowserRouter>
      </UserAuthContextProvider>
    </Container>
  );
}

export default App;
