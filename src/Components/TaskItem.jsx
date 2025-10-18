import React from "react";
import { supabase } from "../lib/supabaseClient";
import toast from "react-hot-toast";

const TaskItem = ({ task, fetchTasks, setEditTask }) => {
  const handleDelete = async () => {
    const { error } = await supabase.from("hackathon").delete().eq("id", task.id);
    if (error) toast.error(error.message);
    else toast.success("Task deleted!");
    fetchTasks();
  };

  return (
    <div className="border p-4 rounded-lg flex justify-between items-center bg-gray-50">
      <div className="flex gap-4 items-center">
        {task.image_url && (
          <img
            src={task.image_url}
            alt="task"
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-gray-800">{task.title}</h3>
          <p className="text-gray-600 text-sm">{task.description}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setEditTask(task)}
          className="bg-yellow-400 text-white px-3 py-1 rounded-lg hover:bg-yellow-500"
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
