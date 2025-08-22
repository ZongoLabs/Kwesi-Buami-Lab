import React from 'react';
import { NavLink } from 'react-router-dom';
import { Card } from '../components/common';
import { TOOL_CATEGORIES } from '../constants';
import { SparklesIcon } from '../components/Icons';

export default function HomePage() {
  const featuredTools = TOOL_CATEGORIES.flatMap(c => c.tools).filter(t => t.id !== 'home');

  return (
    <div className="space-y-8">
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <SparklesIcon className="mx-auto h-16 w-16 text-primary-500" />
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl">Welcome to OmniTools</h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Your indispensable suite for productivity and creativity. Select a tool from the sidebar to get started.
        </p>
      </div>

      <Card title="Featured Tools" icon={<SparklesIcon className="w-6 h-6" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredTools.map((tool) => (
            <NavLink
              key={tool.id}
              to={tool.path}
              className="group block p-6 bg-gray-50 hover:bg-primary-50 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-4">
                <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-primary-500 group-hover:border-primary-200 dark:group-hover:border-primary-800">
                    <span className="w-6 h-6 inline-block">{tool.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">{tool.name}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{tool.description}</p>
                </div>
              </div>
            </NavLink>
          ))}
        </div>
      </Card>
    </div>
  );
}