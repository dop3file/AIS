import React from 'react';

const Button = ({ children, variant = 'primary', className = '', as: Component = 'button', ...props }) => {
    return (
        <Component className={`btn btn-${variant} ${className}`} {...props}>
            {children}
        </Component>
    );
};

export default Button;
