// components/Header.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const Header = () => {
      const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    if (storedUser) setUser(JSON.parse(storedUser))
    else navigate('/')
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('user')
    navigate('/')
  }

  return (
    <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-semibold">My Dashboard</h1>
      <button onClick={handleLogout} className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-gray-100 transition">
        Logout
      </button>
    </header>
  );
};

export default Header;
