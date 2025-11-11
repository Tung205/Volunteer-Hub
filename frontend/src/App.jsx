import { Routes, Route} from 'react-router-dom';

import IntroPage from './pages/IntroPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from "./pages/RegisterPage.jsx";
import EventPage from "./pages/EventPage.jsx";
import DashBoard from "./pages/DashBoard.jsx";

export default function App() {
  return (
      <Routes>
          <Route path="/" element={<IntroPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/event" element={<EventPage/>} />
          <Route path="/dashboard" element={<DashBoard/>} />
      </Routes>
  )
}