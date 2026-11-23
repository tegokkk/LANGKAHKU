import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LazyMotion,
  domAnimation,
  m as Motion,
  useSpring,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

export default function AdaptiveNavPill({ links = [], actions = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const items = [
    ...links.map(([to, label, Icon]) => ({ id: to, to, label, Icon })),
    ...actions,
  ];

  const canExpand = items.length > 1;
  const collapsedWidth = 176;
  const expandedWidth = Math.min(Math.max(items.length * 108 + 32, 460), 820);

  const pillWidth = useSpring(collapsedWidth, {
    stiffness: 220,
    damping: 25,
    mass: 1,
  });

  const activeItem =
    items.find((item) => {
      if (!item.to) return false;
      if (item.to === "/") return location.pathname === "/";
      if (item.to === "/rencana")
        return ["/rencana", "/timbang-pilihan"].includes(location.pathname);
      if (item.to === "/masuk")
        return ["/masuk", "/daftar", "/pemulihan", "/status"].includes(
          location.pathname,
        );
      return (
        location.pathname === item.to ||
        location.pathname.startsWith(`${item.to}/`)
      );
    }) || items[0];

  useEffect(() => {
    if (!canExpand) {
      setExpanded(false);
      pillWidth.set(collapsedWidth);
      return;
    }
    if (hovering) {
      setExpanded(true);
      pillWidth.set(expandedWidth);
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setExpanded(false);
        pillWidth.set(collapsedWidth);
      }, 450);
    }
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, [hovering, canExpand, expandedWidth, pillWidth]);

  if (!items.length) return null;

  const ActiveIcon = activeItem?.Icon;

  const handleSelect = (item) => {
    setIsTransitioning(true);
    if (item.onClick) item.onClick();
    else if (item.to) navigate(item.to);
    setHovering(false);
    setTimeout(() => setIsTransitioning(false), 350);
  };

  return (
    <LazyMotion features={domAnimation}>
      <Motion.nav
        aria-label="Navigasi utama"
        onMouseEnter={() => canExpand && setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onFocus={() => canExpand && setHovering(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHovering(false);
        }}
        className={`adaptive-pill-nav ${expanded ? "is-expanded" : ""} ${isTransitioning ? "is-transitioning" : ""}`}
        style={{
          width: reducedMotion
            ? expanded
              ? expandedWidth
              : collapsedWidth
            : pillWidth,
        }}
      >
        <div className="pill-ridge-top" aria-hidden="true" />
        <div className="pill-hemisphere" aria-hidden="true" />
        <div className="pill-directional" aria-hidden="true" />
        <div className="pill-gloss-main" aria-hidden="true" />
        {expanded && <div className="pill-gloss-accent" aria-hidden="true" />}
        <div className="pill-bottom-shade" aria-hidden="true" />
        <div className="pill-inner-glow" aria-hidden="true" />

        <div className="pill-items-shell">
          {!expanded && activeItem && (
            <button
              type="button"
              className="pill-collapsed-trigger"
              onClick={() =>
                canExpand ? setHovering(true) : handleSelect(activeItem)
              }
              aria-expanded={canExpand ? false : undefined}
            >
              <AnimatePresence mode="wait">
                <Motion.span
                  key={activeItem.id}
                  className="pill-collapsed-label"
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, y: 6, filter: "blur(3px)" }
                  }
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={
                    reducedMotion
                      ? undefined
                      : { opacity: 0, y: -6, filter: "blur(3px)" }
                  }
                  transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                >
                  {ActiveIcon && <ActiveIcon size={16} aria-hidden="true" />}
                  <span>{activeItem.label}</span>
                </Motion.span>
              </AnimatePresence>
            </button>
          )}

          {expanded && (
            <div className="pill-expanded-row">
              {items.map((item, index) => {
                const isActive = activeItem?.id === item.id;
                const Icon = item.Icon;
                return (
                  <Motion.button
                    key={item.id}
                    type="button"
                    aria-current={isActive && item.to ? "page" : undefined}
                    initial={reducedMotion ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: reducedMotion ? 0 : index * 0.045,
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    onClick={() => handleSelect(item)}
                    className={`pill-nav-item ${isActive ? "active" : ""} ${item.variant ? `pill-nav-${item.variant}` : ""}`.trim()}
                  >
                    {Icon && <Icon size={16} aria-hidden="true" />}
                    <span>{item.label}</span>
                  </Motion.button>
                );
              })}
            </div>
          )}
        </div>
      </Motion.nav>
    </LazyMotion>
  );
}
