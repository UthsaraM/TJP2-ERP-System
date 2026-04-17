import { Link, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, Calendar, Activity, Settings, Webhook } from "lucide-react";
import { useAuth } from "../../providers/auth-provider";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Orders", path: "/orders", icon: FileText },
    { name: "Schedule", path: "/schedule", icon: Calendar },
    { name: "Tracking", path: "/tracking", icon: Activity }
  ];

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-slate-300 font-sans">
      {/* Sidebar - Industrial Dashboard Aesthetic */}
      <aside className="w-64 flex flex-col bg-zinc-900 border-r border-zinc-800 shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-zinc-800">
          <Webhook className="w-6 h-6 text-orange-500 mr-3" />
          <h1 className="font-bold text-[14px] text-zinc-100 tracking-wide uppercase">Textile<span className="text-orange-500">ERP</span></h1>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${isActive ? "bg-orange-500/10 text-orange-500" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"}`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? "text-orange-500" : "text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-orange-500 font-bold">
              {user?.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-200 truncate">{user?.name}</span>
              <span className="text-xs text-zinc-500 truncate">{user?.role}</span>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-zinc-400 bg-zinc-800/50 hover:bg-zinc-800 rounded-md transition hover:text-zinc-200">
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col overflow-hidden bg-zinc-950">
        <div className="h-14 flex items-center justify-between px-6 border-b border-zinc-800 bg-zinc-900 shrink-0">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">
              {navItems.find(n => n.path === location.pathname)?.name || "Dashboard"}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-mono text-zinc-500">SYSTEM ONLINE</span>
              </div>
            </div>
        </div>
        <div className="flex-1 overflow-auto p-4 relative">
           <Outlet />
        </div>
      </main>
    </div>
  );
}
