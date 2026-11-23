import { renderHook, waitFor, act, cleanup } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useResource } from "../hooks/useResource";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const response = (data) => ({ ok: true, json: async () => data });

it("an older reload cannot overwrite the response for a newly selected record", async () => {
  let resolveOld;
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce(response({ name: "record A" }))
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockResolvedValueOnce(response({ name: "record B" })),
  );
  const hook = renderHook(({ path }) => useResource(path), {
    initialProps: { path: "/record/a" },
  });
  await waitFor(() => expect(hook.result.current.data?.name).toBe("record A"));
  let pending;
  act(() => {
    pending = hook.result.current.reload();
  });
  hook.rerender({ path: "/record/b" });
  expect(hook.result.current.data).toBeNull();
  await waitFor(() => expect(hook.result.current.data?.name).toBe("record B"));
  await act(async () => {
    resolveOld(response({ name: "stale private record A" }));
    await pending;
  });
  expect(hook.result.current.data.name).toBe("record B");
  hook.rerender({ path: null });
  expect(hook.result.current.data).toBeNull();
});
