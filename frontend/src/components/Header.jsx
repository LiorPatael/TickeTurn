import React, { useContext } from 'react';
import './Header.css';
import { Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const backHome = () => {
    navigate('/');
  }
  return (
    <header className='header'>
      <div className='header-left'>
        {user ? (
          <div className="user-info">
            <span className="user-name">שלום, {user.name}</span>
            <button className='logout-btn' onClick={logout}>התנתק</button>
          </div>
        ) : (
          <>
            <Link to="/login"><button className='header-btn'>Login</button></Link>
            <Link to="/register"><button className='header-btn'>Register</button></Link>
          </>
        )}
      </div>
      <h1><button onClick={backHome}>TickeTurn</button></h1>
    </header>
  );
}

export default Header;
