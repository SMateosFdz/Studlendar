import React, { useState, useRef, useEffect } from "react";

export const Tooltip = ({
  content,
  children,
  placement = "top",
  delayShow = 300,
  delayHide = 100,
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const showTimeout = useRef(0);
  const hideTimeout = useRef(0);

  const showTooltip = () => {
    window.clearTimeout(hideTimeout.current);
    showTimeout.current = window.setTimeout(() => {
      setVisible(true);
      updatePosition();
    }, delayShow);
  };

  const hideTooltip = () => {
    window.clearTimeout(showTimeout.current);
    hideTimeout.current = window.setTimeout(() => {
      setVisible(false);
    }, delayHide);
  };

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 15; // space between tooltip and component

    let top = 0;
    let left = 0;

    switch (placement) {
      case "top":
        top = triggerRect.top - tooltipRect.height - margin + window.scrollY;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
        break;
      case "bottom":
        top = triggerRect.bottom + margin + window.scrollY;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
        break;
      case "left":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
        left = triggerRect.left - tooltipRect.width - margin + window.scrollX;
        break;
      case "right":
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2 + window.scrollY;
        left = triggerRect.right + margin + window.scrollX;
        break;
      default:
        top = triggerRect.top - tooltipRect.height - margin + window.scrollY;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2 + window.scrollX;
    }

    const padding = 8;
    const maxLeft = window.innerWidth - tooltipRect.width - padding;
    if (left < padding) left = padding;
    if (left > maxLeft) left = maxLeft;
    if (top < padding) top = padding;

    setCoords({ top, left });
  };

  useEffect(() => {
    if (!visible) return;
    updatePosition();
    const handleResizeOrScroll = () => updatePosition();
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);
    return () => {
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [visible, placement]);

  const tooltipId = React.useId();

  return (
    <>
      <span
        ref={triggerRef}
        tabIndex={0}
        aria-describedby={visible ? tooltipId : undefined}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
      >
        {children}
      </span>

      {visible && (
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          aria-live="polite"
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            zIndex: 1000,
            maxWidth: 280,
            padding: "12px 16px",
            background: "rgba(255, 255, 255, 1)",
            color: "#023E8A",
            borderRadius: 12,
            fontSize: "clamp(0.75rem, 0.875vw, 0.9rem)",
            fontWeight: 500,
            lineHeight: 1.4,
            pointerEvents: "none",
            userSelect: "none",
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.95)",
            transition:
              "opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1), transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)"
          }}
        >
          {content}
          {/* The arrow */}
          <div
            style={{
              position: "absolute",
              width: 14,
              height: 14,
              background: "rgba(255, 255, 255, 1)",
              transform: "rotate(45deg)",
              ...getArrowStyle(placement),
              zIndex: -1,
            }}
          />
        </div>
      )}
    </>
  );
};

function getArrowStyle(placement) {
  const size = 14;
  switch (placement) {
    case "top":
      return { bottom: -size / 2, left: "50%", marginLeft: -size / 2 };
    case "bottom":
      return { top: -size / 2, left: "50%", marginLeft: -size / 2 };
    case "left":
      return { top: "50%", right: -size / 2, marginTop: -size / 2 };
    case "right":
      return { top: "50%", left: -size / 2, marginTop: -size / 2 };
    default:
      return { bottom: -size / 2, left: "50%", marginLeft: -size / 2 };
  }
}


