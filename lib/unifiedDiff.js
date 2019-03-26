const CHANGE_ADDED = '+';
const CHANGE_REMOVED = '-';
const CHANGE_MARKER = '~';
const CHANGE_NONE = '=';

function changeToType(change) {
  if (change.added) {
    return CHANGE_ADDED;
  } else if (change.removed) {
    return CHANGE_REMOVED;
  } else {
    return CHANGE_NONE;
  }
}

function allChangeLines(change) {
  return lastChangeLines(change, change.count);
}

function firstChangeLines(change, includeCount) {
  let value = change.value;

  if (value[value.length - 1] !== '\n') {
    value += '\n';
  }

  const lines = [];

  let index = 0;
  while (includeCount > 0) {
    let chars = [];

    let char;
    while ((char = value[index]) !== '\n') {
      chars.push(char);
      index += 1;
    }

    lines.push(chars.join(''));

    index += 1;
    includeCount -= 1;
  }

  return lines;
}

function lastChangeLines(change, includeCount) {
  let value = change.value;

  if (value[value.length - 1] !== '\n') {
    value += '\n';
  }

  const lines = [];

  let index = value.length - 2;
  while (includeCount > 0) {
    let chars = [];

    let char;
    while (index > -1 && (char = value[index]) !== '\n') {
      chars.push(char);
      index -= 1;
    }

    lines.push(chars.reverse().join(''));

    index -= 1;
    includeCount -= 1;
  }

  return lines.reverse();
}

function markupReplacementsInDiff(changes) {
  let lastPart;
  changes.forEach((part, partIndex) => {
    if (lastPart && lastPart.removed && part.added) {
      lastPart.replaced = true;
      part.replaced = true;
    }

    lastPart = changes[partIndex];
  });

  return changes;
}

module.exports = function(changes, outputter) {
  const contextLines = 3;

  const contextualRingBuffer = new Array(contextLines);
  let contextualRingIndex = -1;
  let contextualRingInserted = 0;

  changes = markupReplacementsInDiff(changes);

  let hunkCount = 0;
  let hunkOpen = false;
  changes.forEach(change => {
    const changeType = changeToType(change);

    if (changeType === CHANGE_NONE && !hunkOpen) {
      // HUNK START
      const includeCount = Math.min(contextLines, change.count);

      lastChangeLines(change, includeCount).forEach(line => {
        // place the relevant lines into the ring buffer
        contextualRingIndex = (contextualRingIndex + 1) % contextLines;
        contextualRingBuffer[contextualRingIndex] = [CHANGE_NONE, line];
        contextualRingInserted += 1;
      });
    }

    if (changeType === CHANGE_NONE && hunkOpen) {
      // HUNK END
      const includeCount = Math.min(contextLines, change.count);

      firstChangeLines(change, includeCount).forEach(line => {
        outputter([CHANGE_NONE, line]);
      });

      hunkOpen = false;
    }

    if (changeType === CHANGE_ADDED || changeType === CHANGE_REMOVED) {
      if (!hunkOpen) {
        if (hunkCount > 0) {
          outputter([CHANGE_MARKER]);
        }

        hunkCount += 1;
        hunkOpen = true;

        let lastFromIndex;
        let emptyFromIndex;
        // if the ring buffer was ever filled
        if (contextualRingInserted >= contextLines) {
          // The contextual ring has been completely
          // filled at least once.

          // empty ring buffer from the oldest entry
          lastFromIndex = (contextualRingIndex + 1) % contextLines;
          emptyFromIndex = (lastFromIndex + 1) % contextLines;

          // output the first entry
          outputter(contextualRingBuffer[lastFromIndex]);
        } else if (contextualRingIndex > -1) {
          // The contextual ring was only partially filled.
          emptyFromIndex = 0;
          lastFromIndex = contextualRingIndex + 1;
        } else {
          // Cause it to be a noop.
          lastFromIndex = 0;
          emptyFromIndex = 0;
        }

        while (emptyFromIndex !== lastFromIndex) {
          outputter(contextualRingBuffer[emptyFromIndex]);

          emptyFromIndex = (emptyFromIndex + 1) % contextLines;
        }
      }

      allChangeLines(change).forEach(line => {
        outputter([changeType, line]);
      });
    }
  });
};
