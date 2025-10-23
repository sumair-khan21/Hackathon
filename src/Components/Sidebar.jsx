import React from 'react';
import { Rocket, Plus, History, Trash2, X, User, LogOut } from 'lucide-react';

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  handleNewChat,
  savedPitches,
  currentChatId,
  loadPitch,
  handleDeletePitch,
  user,
  handleLogout
}) => {
  return (
    <div
      className={`${
        sidebarOpen ? "w-72" : "w-0"
      } bg-slate-900/80 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 overflow-hidden flex flex-col h-screen fixed lg:relative left-0 top-0 z-50 lg:z-auto`}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-800 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">PitchCraft</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white active:text-cyan-400 transition-colors p-2 -m-2 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={() => {
            handleNewChat();
            if (window.innerWidth < 1024) {
              setSidebarOpen(false);
            }
          }}
          className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2.5 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 touch-manipulation"
        >
          <Plus className="w-5 h-5" />
          New Pitch
        </button>
      </div>

      {/* Saved Pitches */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
          <History className="w-4 h-4" />
          <span>Recent Pitches</span>
        </div>

        {savedPitches.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">
            No saved pitches yet
          </p>
        ) : (
          <div className="space-y-2">
            {savedPitches.map((pitch) => (
              <div
                key={pitch.id}
                className={`group relative p-3 rounded-lg cursor-pointer transition-all ${
                  currentChatId === pitch.id
                    ? "bg-slate-800 border border-cyan-500/50"
                    : "bg-slate-800/30 hover:bg-slate-800/50 border border-transparent active:bg-slate-800/70"
                }`}
                onClick={() => {
                  loadPitch(pitch);
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 pointer-events-none">
                    <p className="text-white font-medium text-sm truncate">
                      {pitch.name || "Untitled"}
                    </p>
                    <p className="text-slate-400 text-xs truncate mt-1">
                      {pitch.tagline}
                    </p>
                    <p className="text-slate-500 text-xs mt-2">
                      {new Date(pitch.created_at).toLocaleDateString()} •{" "}
                      {new Date(pitch.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePitch(pitch.id);
                    }}
                    className="opacity-100 lg:opacity-0 lg:group-hover:opacity-100 text-red-400 hover:text-red-300 active:text-red-200 transition-opacity touch-manipulation p-2 -m-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {user?.user_metadata?.["Display name"] ||
                user?.email?.split("@")[0] ||
                "User"}
            </p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500/10 border border-red-500/30 text-red-400 py-2 rounded-lg hover:bg-red-500/20 active:bg-red-500/30 transition-all flex items-center justify-center gap-2 text-sm touch-manipulation"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;