import logo from './logo.svg';
import './App.css';
import React from "react";
import {BrowserRouter, Link, Route, Routes} from "react-router";
import Employeelist from "./pages/Employeelist";
import Customerlist from "./pages/Customerlist";

function App() {
  return (
      <BrowserRouter>
        {/* Navigation */}
        <nav>
          <Link to="/">Home</Link> |{" "}
          <Link to="/employees">Employees</Link> |{" "}
          <Link to="/customers">Customers</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Employeelist />} />
          <Route path="/employees" element={<Employeelist />} />
          <Route path="/customers" element={<Customerlist />} />
        </Routes>
      </BrowserRouter>
  );
}

export default App;
