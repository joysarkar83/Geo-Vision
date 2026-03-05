import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AddLand from "./pages/AddLand";
import LandDetails from "./pages/LandDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/add-land" element={<AddLand />} />
        <Route path="/land/:id" element={<LandDetails />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;