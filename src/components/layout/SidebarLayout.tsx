import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  BarChart, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import Button from '../ui/Button';

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({ children }) => {
  const { signOut } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  const navigationItems = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Exams', href: '/exams', icon: FileText },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Analytics', href: '/analytics', icon: BarChart },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    
    if (path !== '/' && location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };
  
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <div className="fixed inset-0 flex z-40">
          {/* Sidebar backdrop */}
          {isMobileSidebarOpen && (
            <div 
              className="fixed inset-0 bg-gray-600 bg-opacity-75" 
              onClick={toggleMobileSidebar}
            ></div>
          )}
          
          {/* Sidebar */}
          <div 
            className={`
              fixed inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 
              transform transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <Link to="/" className="text-xl font-bold text-blue-600">ExamGrader</Link>
              <button 
                onClick={toggleMobileSidebar}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 px-2 py-4 overflow-y-auto">
              <nav className="space-y-1">
                {navigationItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActive(item.href) 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      <ItemIcon 
                        size={20} 
                        className={`mr-3 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-500'}`} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => signOut()}
                icon={<LogOut size={18} />}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col">
          <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
            <div className="flex items-center h-16 px-4 border-b border-gray-200">
              <Link to="/" className="text-xl font-bold text-blue-600">ExamGrader</Link>
            </div>
            
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 space-y-1">
                {navigationItems.map((item) => {
                  const ItemIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center px-3 py-2 text-sm font-medium rounded-md
                        ${isActive(item.href) 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'}
                      `}
                    >
                      <ItemIcon 
                        size={20} 
                        className={`mr-3 ${isActive(item.href) ? 'text-blue-500' : 'text-gray-500'}`} 
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => signOut()}
                icon={<LogOut size={18} />}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="lg:hidden flex items-center justify-between pl-1 pr-4 py-2 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <button
              onClick={toggleMobileSidebar}
              className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <Menu size={24} />
            </button>
            <Link to="/" className="text-xl font-bold text-blue-600 ml-2">ExamGrader</Link>
          </div>
        </div>
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;