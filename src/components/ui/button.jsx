// src/components/ui/Button.jsx
// ═════════════════════════════════════════════════════════════════════════════
// AURA NOIR BUTTON COMPONENT
// Sharp-edged buttons + inner shadows (matte black + gold theme)
// ═════════════════════════════════════════════════════════════════════════════

//import React from "react"; // React
import { Loader2 } from "lucide-react"; // spinner icon

const Button = ({
  children, // button text / content
  variant = "primary", // style type
  size = "md", // padding + font size
  isLoading = false, // loading state
  disabled = false, // disabled state
  icon = null, // optional left icon
  onClick, // click handler
  className = "", // extra tailwind classes
  type = "button", // button type
  ...props // any other props
}) => {
  // Base styles (sharp edges, inner shadow-gold-foil/50 ready, accessibility)
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-semibold transition-all duration-200
    rounded-none select-none
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black
  `;

  // Variant styles
  const variants = {
    primary: `
      bg-black
      text-white
      hover:bg-[#1A1A1A]
      focus:ring-[#B8860B]
    `,
    secondary: `
      bg-transparent border-2 border-black
      text-black
      hover:bg-black hover:text-white
      focus:ring-black
    `,
    gold: `
      bg-[#B8860B]
      text-[#0A0A0A]
      hover:bg-[#FFD700]
      focus:ring-[#8B6508]
    `,
    ghost: `
      bg-transparent
      text-[#0A0A0A]
      hover:bg-[#F5F5F5]
      focus:ring-black
    `,
    danger: `
      bg-red-600
      text-white
      hover:bg-red-700
      focus:ring-red-500
    `,
  };

  // Size styles
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
    xl: "px-8 py-4 text-lg",
  };

  return (
    <button
      type={type} // submit/reset/button
      onClick={onClick} // click action
      disabled={disabled || isLoading} // disable during loading too
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} // compose styles
      {...props} // spread remaining props
    >
      {isLoading ? (
        <>
          < Loader2 className="w-4 h-4 animate-spin" /> {/* spinner */}
          <span> Loading...</span> {/* loading text */}
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>} {/* optional icon */}
          {children} {/* main content */}
        </>
      )}
    </button>
  );
};

export default Button; // export component
