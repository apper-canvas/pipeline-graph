import React from "react";
import { cn } from "@/utils/cn";

const Avatar = ({ src, alt, size = "md", className, fallback }) => {
  const sizes = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl"
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={cn(
          "rounded-full object-cover",
          sizes[size],
          className
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium",
        sizes[size],
        className
      )}
    >
      {fallback ? getInitials(fallback) : "?"}
    </div>
  );
};

export default Avatar;