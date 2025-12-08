import { Routes, Route} from 'react-router-dom';
import MainLayout from './components/MainLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from "./pages/RegisterPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import DashBoard from "./pages/DashBoard.jsx";

export default function App() {
  return (
      <Routes>
          <Route path='/' element={<MainLayout/>}>
            <Route index element={<HomePage/>} />
            <Route path="/events" element={<EventPage/>} />
            <Route path="/dashboard" element={<DashBoard/>} />
          </Route>

          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />

      </Routes>
  )
}