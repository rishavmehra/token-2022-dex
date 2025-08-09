"use client";
import React, { useState } from "react";
import {
  useFloating,
  useHover,
  useInteractions,
  useRole,
  useDismiss,
  offset,
  flip,
  shift,
} from "@floating-ui/react";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    middleware: [offset(8), flip(), shift()],
  });

  const hover = useHover(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    dismiss,
    role,
  ]);

  return (
    <>
      <div ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </div>
      {isOpen && (
        <div
          ref={refs.setFloating}
          style={{
            ...floatingStyles,
            zIndex: 9999,
            background: "white",
            color: "#333",
            padding: "20px",
            borderRadius: "12px",
            fontSize: "14px",
            maxWidth: "400px",
            minWidth: "350px",
            whiteSpace: "pre-line",
            boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
            lineHeight: "1.6",
            border: "1px solid #333",
            backdropFilter: "blur(10px)",
            animation: "fadeIn 0.3s ease",
          }}
          {...getFloatingProps()}
        >
          {content}
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
        </div>
      )}
    </>
  );
};

export default Tooltip;

