import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar">
      <Link className="logo" to="/">ClínicaCRM</Link>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/patients">Pacientes</Link></li>
        <li><Link to="/staff">Funcionários</Link></li>
        <li><Link to="/schedule">Agenda</Link></li>
        <li><Link to="/chat">Conversa IA</Link></li>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/procedures">Procedimentos</Link></li>
        <li><Link to="/reports">Atestados/Relatórios</Link></li>
        <li><Link to="/settings">Configurações</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
