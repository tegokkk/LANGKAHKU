import { useEffect, useRef } from "react";

export default function AsmrBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const compact = window.matchMedia?.(
      "(max-width: 767px), (pointer: coarse)",
    ).matches;
    // Touch devices keep the same visual identity without a continuous canvas loop.
    const animate = !reducedMotion && !compact;

    let width = 0;
    let height = 0;
    let animationFrameId = 0;
    let particles = [];
    const mouse = { x: -1000, y: -1000 };

    const MAGNETIC_RADIUS = 260;
    const VORTEX_STRENGTH = 0.065;
    const PULL_STRENGTH = 0.11;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.6 + 0.6;
        this.vx = (Math.random() - 0.5) * 0.22;
        this.vy = (Math.random() - 0.5) * 0.22;
        const isMaroon = Math.random() > 0.35;
        this.color = isMaroon ? "110, 32, 53" : "130, 114, 122";
        this.alpha = Math.random() * 0.18 + 0.08;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.04;
        this.frictionGlow = 0;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.01 && dist < MAGNETIC_RADIUS) {
          const force = (MAGNETIC_RADIUS - dist) / MAGNETIC_RADIUS;
          this.vx += (dx / dist) * force * PULL_STRENGTH;
          this.vy += (dy / dist) * force * PULL_STRENGTH;
          this.vx += (dy / dist) * force * VORTEX_STRENGTH * 9;
          this.vy -= (dx / dist) * force * VORTEX_STRENGTH * 9;
          this.frictionGlow = force * 0.42;
        } else {
          this.frictionGlow *= 0.92;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.94;
        this.vy *= 0.94;
        this.vx += (Math.random() - 0.5) * 0.035;
        this.vy += (Math.random() - 0.5) * 0.035;
        this.rotation +=
          this.rotationSpeed + (Math.abs(this.vx) + Math.abs(this.vy)) * 0.04;

        if (this.x < -20) this.x = width + 20;
        if (this.x > width + 20) this.x = -20;
        if (this.y < -20) this.y = height + 20;
        if (this.y > height + 20) this.y = -20;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        const finalAlpha = Math.min(this.alpha + this.frictionGlow, 0.58);
        ctx.fillStyle = `rgba(${this.color}, ${finalAlpha})`;

        if (this.frictionGlow > 0.2) {
          ctx.shadowBlur = 7 * this.frictionGlow;
          ctx.shadowColor = `rgba(110, 32, 53, ${this.frictionGlow * 0.7})`;
        }

        ctx.beginPath();
        ctx.moveTo(0, -this.size * 2.4);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size * 2.4);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    const init = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const count = compact ? 36 : 420;
      particles = Array.from({ length: count }, () => new Particle());
      ctx.fillStyle = "#f7f3ed";
      ctx.fillRect(0, 0, width, height);
      if (!animate) {
        particles.forEach((p) => p.draw());
      }
    };

    const render = () => {
      ctx.fillStyle = "rgba(247, 243, 237, 0.22)";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    const handleTouchMove = (e) => {
      if (e.touches[0]) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };

    window.addEventListener("resize", init);
    if (animate) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseleave", handleMouseLeave);
      window.addEventListener("touchmove", handleTouchMove, { passive: true });
    }

    init();
    if (animate) render();

    return () => {
      window.removeEventListener("resize", init);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="asmr-bg-canvas" aria-hidden="true" />;
}
