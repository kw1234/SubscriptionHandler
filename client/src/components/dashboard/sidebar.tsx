import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  History, 
  Settings 
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard", active: true },
    { path: "/users", icon: Users, label: "Users" },
    { path: "/payments", icon: CreditCard, label: "Payments" },
    { path: "/activity", icon: History, label: "Activity Logs" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="bg-white w-64 shadow-lg flex-shrink-0">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-medium text-material-gray">SubManager Pro</h1>
        <p className="text-sm text-gray-500 mt-1">Admin Dashboard</p>
      </div>
      
      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.active || location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <div className={`px-6 py-2 cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 border-r-4 border-material-blue' 
                  : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center">
                  <Icon className={`mr-3 w-5 h-5 ${
                    isActive ? 'text-material-blue' : 'text-gray-600'
                  }`} />
                  <span className={`${
                    isActive ? 'font-medium text-material-blue' : 'text-gray-700'
                  }`}>
                    {item.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
