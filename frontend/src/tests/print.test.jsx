import { readFileSync } from "node:fs";
import { render, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ViewTransition } from "../components/ui";

afterEach(cleanup);

it("prints the plan through nested transition wrappers while hiding private forms and panels", () => {
  // Apply the actual print rules as the active medium; jsdom has no printer emulation.
  const css = readFileSync("src/styles/index.css", "utf8");
  const start = css.lastIndexOf("@media print {") + "@media print {".length;
  const style = document.createElement("style");
  style.textContent = css.slice(start, css.lastIndexOf("}"));
  document.head.append(style);
  try {
    const { container } = render(
      <>
        <main className="main-content">
          <ViewTransition transitionKey="route">
            <h1>Editor rencana</h1>
            <ViewTransition transitionKey="plan">
              <fieldset>
                <textarea defaultValue="Catatan pribadi di formulir" />
              </fieldset>
              <section className="print-only print-plan">
                <h1>Rencana cetak</h1>
                <p>Langkah yang dipilih siswa</p>
              </section>
            </ViewTransition>
          </ViewTransition>
        </main>
        <div className="panel-backdrop">Jurnal privat</div>
      </>,
    );
    let printed = container.querySelector(".print-only");
    while (printed && printed !== container) {
      expect(getComputedStyle(printed).display).not.toBe("none");
      printed = printed.parentElement;
    }
    expect(getComputedStyle(container.querySelector("fieldset")).display).toBe(
      "none",
    );
    expect(
      getComputedStyle(container.querySelector(".panel-backdrop")).display,
    ).toBe("none");
    expect(
      getComputedStyle(container.querySelector(".print-only p")).display,
    ).not.toBe("none");
  } finally {
    style.remove();
  }
});
