// // components/TaskList.jsx
// import React, { useEffect } from "react";
// import TaskItem from "./TaskItem";

// const TaskList = ({ fetchTasks, tasks, setEditTask }) => {
//   useEffect(() => {
//     fetchTasks();
//   }, []);

//   return (
//     <div className="space-y-4 mt-5">
//       {tasks.length > 0 ? (
//         tasks.map((task) => (
//           <TaskItem
//             key={task.id}
//             task={task}
//             fetchTasks={fetchTasks}
//             setEditTask={setEditTask}
//           />
//         ))
//       ) : (
//         <p className="text-gray-500 text-center">No tasks found.</p>
//       )}
//     </div>
//   );
// };

// export default TaskList;


