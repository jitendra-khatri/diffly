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

test("optionally treats escaped newlines as line breaks", () => {
  const literalComparison = compareText("first\\nsecond", "first\\nthird", { mode: "lines" });
  assert.equal(literalComparison.rows.length, 1);
  assert.equal(literalComparison.rows[0].leftText, "first\\nsecond");

  const expandedComparison = compareText("first\\nsecond", "first\\nthird", {
    mode: "lines",
    convertEscapedNewlines: true,
  });
  assert.equal(expandedComparison.rows.length, 2);
  assert.equal(expandedComparison.rows[0].kind, "equal");
  assert.equal(expandedComparison.rows[0].leftText, "first");
  assert.equal(expandedComparison.rows[1].kind, "change");
  assert.equal(expandedComparison.rows[1].leftText, "second");
  assert.equal(expandedComparison.rows[1].rightText, "third");
});

test("formats JSON and ignores object key order", () => {
  const result = compareText(
    '{"profile":{"name":"Ada","active":true},"version":1}',
    '{"version":1,"profile":{"active":true,"name":"Ada"}}',
    { mode: "words", formatJson: true },
  );
  assert.deepEqual(result.summary, { additions: 0, removals: 0, changes: 0 });
  assert.ok(result.rows.length > 1);
});

test("keeps JSON array order and highlights changed values", () => {
  const result = compareText(
    '{"items":[1,2],"status":"draft"}',
    '{"status":"ready","items":[2,1]}',
    { mode: "words", formatJson: true },
  );
  assert.ok(result.summary.changes > 0);
  assert.ok(result.rows.some((row) => row.leftText.includes('"draft"')));
  assert.ok(result.rows.some((row) => row.rightText.includes('"ready"')));
});

test("reports which JSON input is invalid", () => {
  assert.throws(
    () => compareText('{"valid":true}', '{"broken":}', { mode: "words", formatJson: true }),
    /Revised JSON is invalid/,
  );
});

test("does not expand escaped newlines inside formatted JSON strings", () => {
  const result = compareText(
    '{"message":"first\\nsecond"}',
    '{"message":"first\\nsecond"}',
    { mode: "words", formatJson: true, convertEscapedNewlines: true },
  );
  assert.deepEqual(result.summary, { additions: 0, removals: 0, changes: 0 });
  assert.ok(result.rows.some((row) => row.leftText.includes("\\n")));
});
