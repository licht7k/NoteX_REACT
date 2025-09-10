import React, { useState, useRef, useEffect } from 'react'
import { MdOutlineInsertEmoticon } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'; 
import { Navigate } from 'react-router-dom';

const Navbar = () => {

  const navigate = useNavigate();

  const [user, setUser] = useState(null)
  
  const [menuOpen, setMenuOpen] = useState(false);

  const location = useLocation();

  const isActive = (path) => location.pathname === path;





  //detect clicks outside the menu to close it
  const menuRef = useRef(null);

  //function to handle clicks outside the menu
  useEffect(() => {
    const handleDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData){
      try{
        setUser(JSON.parse(userData));
      }catch (e){
        console.log(e);
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    setMenuOpen(false);
  };

 

  return(
    <nav className='bg-gray-600 shadow-md py-4'>
      <div className='flex items-center justify-between'>
      <h1 className={`ml-4 text-white cursor-pointer hover:text-blue-600 ${isActive('/home')  ? 'border-b-2 border-blue-600' : ''}`} onClick={() => navigate('/home')}>NoteX</h1>
        
        {user && (user.role === 'admin' || user.role === 'moderator') && (
          <button
          onClick={() => navigate('/admin')}
          className={`text-white ml-250 cursor-pointer hover:text-blue-600 ${isActive('/admin') ? 'border-b-2 border-blue-600' : ''}`}
          >
            Admin dashboard
          </button>
        )}

        <div className='relative ' ref={menuRef}>
          <MdOutlineInsertEmoticon className='text-white mr-4 cursor-pointer hover:text-blue-600' size={25} onClick={() => setMenuOpen(prev => !prev)} />
          
          {menuOpen && (
            <div className="absolute right-0 mt-2 mr-4 w-55 bg-white border rounded shadow-md z-50">
              <div className="px-3 py-2 border-b">
                <div className="text-sm font-medium">{user ? user.name : 'User name'}</div>
                <div title={user ? user.email : 'User email'} className="text-xs text-gray-500 truncate w-47 cursor-pointer">{user ? user.email : 'User email'}</div>
              </div>

            

              <button
                
                onClick={ () => {if(window.confirm('Are you sure you want to logout?')) handleLogout()}}
                
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                
              >
                Logout
              </button>
            </div>
          )}
        
        
        </div>
        
      </div>
    </nav>

    
    )
}

export default Navbar
