import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <ul>
        <li>
          <NavLink
            to="/"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/tax-form"
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            Tax Form
          </NavLink>
        </li>
        {/* Add More Links? */}
      </ul>
    </nav>
  );
}

export default Navbar;
