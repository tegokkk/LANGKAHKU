import { LazyMotion, domAnimation, m as Motion, useReducedMotion } from "framer-motion";

const STAGGER = 0.024;

export default function TextRoll({
  children = "",
  className = "",
  center = false,
}) {
  const reducedMotion = useReducedMotion();
  const str = String(children || "");

  if (reducedMotion || !str) {
    return <span className={className}>{str}</span>;
  }

  const words = str.split(" ");
  const totalChars = str.replace(/\s+/g, "").length;
  let charIndex = 0;

  return (
    <LazyMotion features={domAnimation}>
      <Motion.span
        initial="initial"
        whileHover="hovered"
        className={`text-roll ${className}`.trim()}
      >
        <span className="sr-only">{str}</span>
        <span className="text-roll-visual" aria-hidden="true">
          {words.map((word, wIdx) => {
            const chars = Array.from(word);
            return (
              <span className="text-roll-word" key={`${wIdx}-${word}`}>
                {chars.map((char) => {
                  const i = charIndex++;
                  const delay = center
                    ? STAGGER * Math.abs(i - (totalChars - 1) / 2)
                    : Math.min(STAGGER * i, 0.45);
                  return (
                    <span className="text-roll-char" key={i}>
                      <Motion.span
                        className="text-roll-top"
                        variants={{
                          initial: { y: "0%" },
                          hovered: { y: "-100%" },
                        }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                          delay,
                        }}
                      >
                        {char}
                      </Motion.span>
                      <Motion.span
                        className="text-roll-bot"
                        variants={{
                          initial: { y: "100%" },
                          hovered: { y: "0%" },
                        }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                          delay,
                        }}
                      >
                        {char}
                      </Motion.span>
                    </span>
                  );
                })}
                {wIdx < words.length - 1 && (
                  <span className="text-roll-space">{"\u00A0"}</span>
                )}
              </span>
            );
          })}
        </span>
      </Motion.span>
    </LazyMotion>
  );
}
