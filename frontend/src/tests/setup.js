import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";
import { vi } from "vitest";

// Route-level lazy imports can take over one second on a busy Windows runner.
configure({ asyncUtilTimeout: 5000 });
HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
window.scrollTo = vi.fn();
