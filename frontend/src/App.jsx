import { Routes, Route, Navigate } from 'react-router-dom';

import IntroPage from './pages/IntroPage.jsx';
import RegisterPage from "./pages/RegisterPage.jsx";
import EventPage from "./pages/EventPage.jsx";

export default function App() {
  return (
      <Routes>
          <Route path="/" element={<IntroPage/>} />
          <Route path="/register" element={<RegisterPage/>} />
          <Route path="/event" element={<EventPage/>} />
      </Routes>
  )
}