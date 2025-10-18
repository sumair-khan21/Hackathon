// import React, { useEffect, useState } from 'react'
// import { supabase } from '../lib/supabaseClient'
// import { useNavigate } from 'react-router-dom'

// const Dashboard = () => {
//   const navigate = useNavigate()
//   const [user, setUser] = useState(null)

//   useEffect(() => {
//     const storedUser = localStorage.getItem('user')
//     if (storedUser) setUser(JSON.parse(storedUser))
//     else navigate('/')
//   }, [])

//   const handleLogout = async () => {
//     await supabase.auth.signOut()
//     localStorage.removeItem('user')
//     navigate('/')
//   }

//   return (
//     <div className="bg-white shadow-lg rounded-2xl p-10 text-center w-[90%] max-w-lg">
//       <h2 className="text-2xl font-semibold mb-4 text-gray-800">
//         Welcome, <span className="text-indigo-600">{user?.email}</span>
//       </h2>
//       <button
//         onClick={handleLogout}
//         className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-all"
//       >
//         Logout
//       </button>
//     </div>
//   )
// }

// export default Dashboard













// pages/Dashboard.jsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Sidebar from "../Components/Sidebar";
import Header from "../Components/Header";
import TaskForm from "../Components/TaskForm";
import TaskList from "../Components/TaskList";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from("hackathon").select("*").order("id");
    if (!error) setTasks(data);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="p-6 bg-gray-50 flex flex-col gap-6">
          <TaskForm
            fetchTasks={fetchTasks}
            editTask={editTask}
            setEditTask={setEditTask}
          />
          <TaskList
            fetchTasks={fetchTasks}
            tasks={tasks}
            setEditTask={setEditTask}
          />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
