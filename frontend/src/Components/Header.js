import { React, useState, useContext } from 'react'
import { Link, useHistory } from 'react-router-dom'
import './Header.css'
import { AuthContext } from '../Context/AuthContext'

import MenuIcon from '@material-ui/icons/Menu';
import ClearIcon from '@material-ui/icons/Clear';

function Header() {
    const { user, dispatch } = useContext(AuthContext)
    const [menutoggle, setMenutoggle] = useState(false)
    const history = useHistory()

    const Toggle = () => {
        setMenutoggle(!menutoggle)
    }

    const closeMenu = () => {
        setMenutoggle(false)
    }

    const handleLogout = () => {
        dispatch({ type: "LOGOUT" });
        localStorage.removeItem("user");
        closeMenu();
        history.push("/signin");
    }

    return (
        <div className="header">
            <div className="logo-nav">
                <Link to='/' onClick={closeMenu} className="logo-link">
                    LIBRARY
                </Link>
            </div>
            <div className='nav-right'>
                <ul className={menutoggle ? "nav-options active" : "nav-options"}>
                    <li className="option" onClick={closeMenu}>
                        <Link to='/'>Home</Link>
                    </li>
                    <li className="option" onClick={closeMenu}>
                        <Link to='/books'>Books</Link>
                    </li>
                    {user ? (
                        <>
                            <li className="option" onClick={closeMenu}>
                                <Link to={user.isAdmin ? '/dashboard@admin' : '/dashboard@user'}>Dashboard</Link>
                            </li>
                            <li className="option">
                                <button onClick={handleLogout} className="logout-btn">Logout</button>
                            </li>
                        </>
                    ) : (
                        <li className="option" onClick={closeMenu}>
                            <Link to='/signin'>SignIn</Link>
                        </li>
                    )}
                </ul>
            </div>

            <div className="mobile-menu" onClick={() => { Toggle() }}>
                {menutoggle ? (
                    <ClearIcon className="menu-icon" style={{ fontSize: 40 }} />
                ) : (
                    <MenuIcon className="menu-icon" style={{ fontSize: 40 }} />
                )}
            </div>
        </div>
    )
}

export default Header
