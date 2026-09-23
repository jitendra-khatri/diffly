const WORD_PATTERN = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]+/gu;

function comparable(value, options) {
  let next = value;
  if (options.ignoreCase) next = next.toLocaleLowerCase();
  if (options.trimWhitespace) next = next.replace(/\s+/g, " ").trim();
  return next;
}

export function diffSequence(before, after, options = {}) {
  const left = before.map((value) => comparable(value, options));
  const right = after.map((value) => comparable(value, options));
  const rows = left.length + 1;
  const columns = right.length + 1;

  // Keep very large pastes responsive. The unchanged prefix/suffix is retained,
  // while an oversized middle is represented as one replacement block.
  if (left.length * right.length > 2_000_000) {
    let start = 0;
    while (start < left.length && start < right.length && left[start] === right[start]) start += 1;
    let leftEnd = left.length - 1;
    let rightEnd = right.length - 1;
    while (leftEnd >= start && rightEnd >= start && left[leftEnd] === right[rightEnd]) {
      leftEnd -= 1;
      rightEnd -= 1;
    }
    return [
      ...before.slice(0, start).map((value) => ({ type: "equal", value })),
      ...before.slice(start, leftEnd + 1).map((value) => ({ type: "remove", value })),
      ...after.slice(start, rightEnd + 1).map((value) => ({ type: "add", value })),
      ...before.slice(leftEnd + 1).map((value) => ({ type: "equal", value })),
    ];
  }

  const table = Array.from({ length: rows }, () => new Uint32Array(columns));
  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i][j] = left[i] === right[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const changes = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      changes.push({ type: "equal", value: before[i] });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      changes.push({ type: "remove", value: before[i] });
      i += 1;
    } else {
      changes.push({ type: "add", value: after[j] });
      j += 1;
    }
  }
  while (i < left.length) changes.push({ type: "remove", value: before[i++] });
  while (j < right.length) changes.push({ type: "add", value: after[j++] });
  return changes;
}

function wordParts(before, after, options) {
  const leftTokens = before.match(WORD_PATTERN) || [];
  const rightTokens = after.match(WORD_PATTERN) || [];
  const changes = diffSequence(leftTokens, rightTokens, options);
  return {
    left: changes
      .filter((change) => change.type !== "add")
      .map((change) => ({ value: change.value, changed: change.type === "remove" })),
    right: changes
      .filter((change) => change.type !== "remove")
      .map((change) => ({ value: change.value, changed: change.type === "add" })),
  };
}

export function compareText(beforeText, afterText, options = {}) {
  const before = beforeText.replace(/\r\n/g, "\n").split("\n");
  const after = afterText.replace(/\r\n/g, "\n").split("\n");
  const changes = diffSequence(before, after, options);
  const rows = [];
  let leftLine = 1;
  let rightLine = 1;

  for (let index = 0; index < changes.length;) {
    const change = changes[index];
    if (change.type === "equal") {
      rows.push({
        kind: "equal",
        leftNumber: leftLine++,
        rightNumber: rightLine++,
        leftText: change.value,
        rightText: change.value,
      });
      index += 1;
      continue;
    }

    const removed = [];
    const added = [];
    while (index < changes.length && changes[index].type !== "equal") {
      const current = changes[index];
      (current.type === "remove" ? removed : added).push(current.value);
      index += 1;
    }

    const blockSize = Math.max(removed.length, added.length);
    for (let offset = 0; offset < blockSize; offset += 1) {
      const leftText = removed[offset];
      const rightText = added[offset];
      const isChange = leftText !== undefined && rightText !== undefined;
      const parts = isChange && options.mode === "words"
        ? wordParts(leftText, rightText, options)
        : null;
      rows.push({
        kind: isChange ? "change" : leftText !== undefined ? "remove" : "add",
        leftNumber: leftText !== undefined ? leftLine++ : null,
        rightNumber: rightText !== undefined ? rightLine++ : null,
        leftText: leftText ?? "",
        rightText: rightText ?? "",
        leftParts: parts?.left,
        rightParts: parts?.right,
      });
    }
  }

  return {
    rows,
    summary: rows.reduce(
      (summary, row) => {
        if (row.kind === "add") summary.additions += 1;
        if (row.kind === "remove") summary.removals += 1;
        if (row.kind === "change") summary.changes += 1;
        return summary;
      },
      { additions: 0, removals: 0, changes: 0 },
    ),
  };
}
