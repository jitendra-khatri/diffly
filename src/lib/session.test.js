import test from "node:test";
import assert from "node:assert/strict";
import { readSessionContent, SESSION_STORAGE_KEY, writeSessionContent } from "./session.js";

function createStorage(initialValue = null) {
  let value = initialValue;
  return {
    getItem: () => value,
    setItem: (key, nextValue) => {
      assert.equal(key, SESSION_STORAGE_KEY);
      value = nextValue;
    },
  };
}

test("restores valid content from session storage", () => {
  const storage = createStorage(JSON.stringify({ original: "before", revised: "after" }));
  assert.deepEqual(readSessionContent(storage, { original: "sample", revised: "sample" }), {
    original: "before",
    revised: "after",
  });
});

test("falls back safely when stored content is invalid", () => {
  const fallback = { original: "sample A", revised: "sample B" };
  assert.deepEqual(readSessionContent(createStorage("not json"), fallback), fallback);
});

test("stores only the two comparison texts", () => {
  const storage = createStorage();
  assert.equal(writeSessionContent(storage, { original: "one", revised: "two", ignored: true }), true);
  assert.deepEqual(readSessionContent(storage, { original: "", revised: "" }), {
    original: "one",
    revised: "two",
  });
});
