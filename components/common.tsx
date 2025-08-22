import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const Card = ({ children, className = '', title, icon }: CardProps) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
    {title && (
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
        {icon && <span className="text-primary-500">{icon}</span>}
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
      </div>
    )}
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, className = '', isLoading = false, ...props }, ref) => (
  <button
    ref={ref}
    className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
      isLoading 
        ? 'bg-primary-400 dark:bg-primary-700 cursor-not-allowed' 
        : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'
    } ${className}`}
    disabled={isLoading}
    {...props}
  >
    {isLoading && (
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    )}
    {isLoading ? 'Processing...' : children}
  </button>
));
Button.displayName = 'Button';

interface AlertProps {
    message: string;
    type: 'error' | 'success' | 'info';
}
export const Alert = ({ message, type }: AlertProps) => {
    const baseClasses = 'p-4 rounded-md text-sm';
    const typeClasses = {
        error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    };
    
    if (!message) return null;

    return <div className={`${baseClasses} ${typeClasses[type]}`}>{message}</div>
}

export const Spinner = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary-500"></div>
    </div>
);