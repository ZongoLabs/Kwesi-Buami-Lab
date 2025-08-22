

import React, { useState, useMemo } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { TOOL_CATEGORIES } from './constants';
import { type Tool, type ToolCategory } from './types';
import { MenuIcon, XIcon, SparklesIcon, MagnifyingGlassIcon } from './components/Icons';

const getToolByPath = (path: string): Tool | undefined => {
    return TOOL_CATEGORIES.flatMap(c => c.tools).find(t => t.path === path);
};

const Header = ({ onMenuClick, currentTool }: { onMenuClick: () => void; currentTool?: Tool }) => (
    <header className="bg-white/75 dark:bg-gray-800/75 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
        <div className="flex items-center gap-2">
            <span className="text-primary-500">{currentTool?.icon}</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">{currentTool?.name || 'OmniTools'}</h1>
        </div>
        <button onClick={onMenuClick} className="p-1 text-gray-600 hover:text-primary-500 dark:text-gray-300 dark:hover:text-primary-400">
            <MenuIcon />
        </button>
    </header>
);

const Sidebar = ({ isSidebarOpen, setSidebarOpen }: { isSidebarOpen: boolean, setSidebarOpen: (isOpen: boolean) => void }) => {
    const navLinkClasses = 'flex items-center gap-3 rounded-lg px-3 py-2 text-gray-300 transition-all hover:bg-gray-700 hover:text-white';
    const activeNavLinkClasses = 'bg-primary-700 text-white';
    const [searchTerm, setSearchTerm] = useState('');

    const filteredCategories = useMemo(() => {
        if (!searchTerm) {
            return TOOL_CATEGORIES;
        }

        const lowercasedFilter = searchTerm.toLowerCase();
        
        const filtered = TOOL_CATEGORIES.map(category => {
            const filteredTools = category.tools.filter(tool => 
                tool.name.toLowerCase().includes(lowercasedFilter) || 
                tool.description.toLowerCase().includes(lowercasedFilter) ||
                tool.category.toLowerCase().includes(lowercasedFilter) ||
                tool.id.toLowerCase().includes(lowercasedFilter)
            );
            return { ...category, tools: filteredTools };
        }).filter(category => category.tools.length > 0);

        return filtered;
    }, [searchTerm]);


    return (
        <>
            <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-900 border-r border-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
                        <NavLink to="/" className="flex items-center gap-2 font-semibold text-white">
                            <SparklesIcon className="h-6 w-6 text-primary-500" />
                            <span>OmniTools</span>
                        </NavLink>
                        <button onClick={() => setSidebarOpen(false)} className="p-1 text-gray-400 hover:text-white lg:hidden">
                            <XIcon />
                        </button>
                    </div>
                    <div className="px-4 py-2">
                        <div className="relative">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search tools..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-800 text-gray-200 border-gray-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                    <nav className="flex-1 overflow-y-auto px-4 py-2">
                        <ul className="grid items-start gap-y-4">
                            {filteredCategories.map((category) => (
                                <li key={category.name}>
                                    <div className="px-3 text-xs font-semibold uppercase text-gray-500">{category.name !== 'Home' && category.name}</div>
                                    <ul className="mt-2 space-y-1">
                                    {category.tools.map((tool) => (
                                        <li key={tool.id}>
                                            <NavLink
                                                to={tool.path}
                                                onClick={() => setSidebarOpen(false)}
                                                className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}
                                            >
                                                <span className="w-5 h-5">{tool.icon}</span>
                                                {tool.name}
                                            </NavLink>
                                        </li>
                                    ))}
                                    </ul>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 lg:hidden"></div>}
        </>
    );
};

const AppContent = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();
    const currentTool = getToolByPath(location.pathname);

    const allTools = TOOL_CATEGORIES.flatMap(c => c.tools);

    return (
        <div className="flex min-h-screen w-full bg-gray-100 dark:bg-gray-950">
            <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
            <div className="flex flex-col flex-1">
                <Header onMenuClick={() => setSidebarOpen(true)} currentTool={currentTool} />
                <main className="flex-1 p-4 sm:p-6 md:p-8">
                    <Routes>
                        {allTools.map((tool) => (
                            <Route key={tool.id} path={tool.path} element={<tool.component />} />
                        ))}
                    </Routes>
                </main>
            </div>
            <Toaster 
                position="bottom-right"
                toastOptions={{
                    className: 'dark:bg-gray-700 dark:text-gray-100',
                }}
            />
        </div>
    );
};

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}