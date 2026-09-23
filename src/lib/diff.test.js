import test from "node:test";
import assert from "node:assert/strict";
import { compareText } from "./diff.js";

test("aligns a changed line and highlights word edits", () => {
  const result = compareText("hello bright world", "hello calm world", { mode: "words" });
  assert.equal(result.summary.changes, 1);
  assert.deepEqual(
    result.rows[0].leftParts.filter((part) => part.changed).map((part) => part.value),
    ["bright"],
  );
  assert.deepEqual(
    result.rows[0].rightParts.filter((part) => part.changed).map((part) => part.value),
    ["calm"],
  );
});

test("tracks inserted and removed lines", () => {
  const result = compareText("one\ntwo\nthree", "one\nthree\nfour", { mode: "lines" });
  assert.equal(result.summary.removals, 1);
  assert.equal(result.summary.additions, 1);
  assert.equal(result.summary.changes, 0);
});

test("can ignore case and whitespace", () => {
  const result = compareText("HELLO   WORLD", "hello world", {
    mode: "words",
    ignoreCase: true,
    trimWhitespace: true,
  });
  assert.equal(result.summary.changes, 0);
  assert.equal(result.rows[0].kind, "equal");
});
