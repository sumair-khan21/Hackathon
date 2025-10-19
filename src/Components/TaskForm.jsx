// import React, { useState } from "react";
// import { supabase } from "../lib/supabaseClient";
// import toast from "react-hot-toast";

// const TaskForm = ({ fetchTasks, editTask, setEditTask }) => {
//   const [title, setTitle] = useState(editTask?.title || "");
//   const [description, setDescription] = useState(editTask?.description || "");
//   const [imageFile, setImageFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     let imageUrl = editTask?.image_url || null;

//     if (imageFile) {
//       const fileName = `${Date.now()}-${imageFile.name}`;
//       const { data: uploadData, error: uploadError } = await supabase.storage
//         .from("hackathon-images")
//         .upload(fileName, imageFile);

//       if (uploadError) {
//         toast.error("Image upload failed!");
//         setLoading(false);
//         return;
//       }

//       // Get public URL
//       const { data: publicUrl } = supabase.storage
//         .from("hackathon-images")
//         .getPublicUrl(fileName);
//       imageUrl = publicUrl.publicUrl;
//     }

//     // 🧾 Step 2: Insert or update task
//     if (editTask) {
//       const { error } = await supabase
//         .from("hackathon")
//         .update({ title, description, image_url: imageUrl })
//         .eq("id", editTask.id);
//       if (error) toast.error(error.message);
//       else toast.success("Task updated!");
//       setEditTask(null);
//     } else {
//       const { error } = await supabase
//         .from("hackathon")
//         .insert([{ title, description, image_url: imageUrl }]);
//       if (error) toast.error(error.message);
//       else toast.success("Task added!");
//     }

//     setTitle("");
//     setDescription("");
//     setImageFile(null);
//     fetchTasks();
//     setLoading(false);
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="bg-white p-5 rounded-lg shadow-md space-y-4"
//     >
//       <h2 className="text-xl font-semibold">
//         {editTask ? "Edit Task" : "Add New Task"}
//       </h2>

//       <input
//         type="text"
//         placeholder="Task Title"
//         value={title}
//         onChange={(e) => setTitle(e.target.value)}
//         required
//         className="w-full p-2 border rounded-lg"
//       />

//       <textarea
//         placeholder="Task Description"
//         value={description}
//         onChange={(e) => setDescription(e.target.value)}
//         required
//         className="w-full p-2 border rounded-lg"
//       ></textarea>

//       {/* 🖼 File Upload Input */}
//       <input
//         type="file"
//         accept="image/*"
//         onChange={(e) => setImageFile(e.target.files[0])}
//         className="w-full border p-2 rounded-lg bg-gray-50"
//       />

//       <button
//         type="submit"
//         disabled={loading}
//         className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
//       >
//         {loading ? "Saving..." : editTask ? "Update Task" : "Add Task"}
//       </button>
//     </form>
//   );
// };

// export default TaskForm;


