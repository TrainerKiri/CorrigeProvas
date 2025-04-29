import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  footer?: React.ReactNode;
  hover?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
  hover = false,
}) => {
  return (
    <div 
      className={`
        bg-white rounded-lg shadow overflow-hidden 
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:translate-y-[-2px]' : ''}
        ${className}
      `}
    >
      {title && (
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        </div>
      )}
      <div className="px-5 py-5">{children}</div>
      {footer && (
        <div className="bg-gray-50 px-5 py-3 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;