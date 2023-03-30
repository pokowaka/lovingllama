import "./App.css"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { QuestionForm } from "./components/QA"
import { UserAuthContextProvider } from "./context/UserAuthContext"
import Container from "@mui/material/Container"
import Forgot from "./components/Forgot"
import Login from "./components/Login"
import Navbar from "./components/Navbar"
import Signup from "./components/Signup"
import ItemList from "./components/ItemList"
import EntryView from "./components/Entry"
import EntryTable from "./components/EntryTable"
import { useUserAuth } from "./context/UserAuthContext"
import { User } from "firebase/auth"


interface ProtectedRouteProps {
  redirectPath: string,
  // children: React.Component
}

const ProtectedRoute = ({
  redirectPath = '/landing',
}: ProtectedRouteProps) => {

  const { user } = useUserAuth()

  if (!user) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet/>
  // return children ? children : <Outlet />
}

function App() {
  return (
    <Container maxWidth="xl" sx={{ p: "0px !important" }}>
      <UserAuthContextProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot" element={<Forgot />} />
            <Route element={<ProtectedRoute redirectPath="/" />}>å
              <Route path="/home" element={<EntryTable />} />
              <Route path="/entry/:id" element={<EntryView />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserAuthContextProvider>
    </Container>
  )
}

export default App
