import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

/**
 * Shared Button Component for ODOS.
 */
export const Button = ({ label, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      style={{
        padding: '10px 20px',
        borderRadius: '12px',
        background: '#6d28d9',
        color: '#ffffff',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '14px',
        ...props.style,
      }}
    >
      {label}
    </button>
  );
};
