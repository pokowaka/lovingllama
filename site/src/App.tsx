import "./App.css"
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"
import { UserAuthContextProvider } from "./context/UserAuthContext"
import Container from "@mui/material/Container"
import Forgot from "./components/Forgot"
import Login from "./components/Login"
import Navbar from "./components/Navbar"
import Signup from "./components/Signup"
import EntryView, {EntryViewWrapper} from "./components/Entry"
import EntryTable from "./components/EntryTable"
import { useUserAuth } from "./context/UserAuthContext"
import CreateEntryView from './components/Create'
import About from './components/About'


interface ProtectedRouteProps {
  redirectPath: string,
  // children: React.Component
}

const ProtectedRoute = ({
  redirectPath = '/landing',
}: ProtectedRouteProps) => {
  const { user } = useUserAuth()
  if (!user) {
    return <Login />
  }

  return <Outlet />
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
            <Route path="/about" element={<About />} />
            <Route element={<ProtectedRoute redirectPath="/" />}>
              <Route path="/entries" element={<EntryTable />} />
              <Route path="/create" element={<CreateEntryView />} />
              <Route path="/entry/:id" element={<EntryViewWrapper />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </UserAuthContextProvider>
    </Container>
  )
}

export default App
