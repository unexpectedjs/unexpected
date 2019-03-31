const CHANGE_ADDED = '+';
const CHANGE_ADDED_HIGHLIGHT = '>';
const CHANGE_REMOVED = '-';
const CHANGE_REMOVED_HIGHLIGHT = '<';
const CHANGE_MARKER = '~';
const CHANGE_NONE = '=';

const changeTypeToHighlight = {
  [CHANGE_ADDED]: CHANGE_ADDED_HIGHLIGHT,
  [CHANGE_REMOVED]: CHANGE_REMOVED_HIGHLIGHT
};

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

function firstChangeLines(change, maxLines) {
  let includeCount = Math.min(maxLines, change.count);
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

function lastChangeLines(change, maxLines) {
  let includeCount = Math.min(maxLines, change.count);
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
  function contextualRingInsert(line) {
    contextualRingIndex = (contextualRingIndex + 1) % contextLines;
    contextualRingBuffer[contextualRingIndex] = line;
    contextualRingInserted += 1;
  }

  changes = markupReplacementsInDiff(changes);

  let hunkCount = 0;
  let hunkOpen = false;
  changes.forEach((change, changeIndex) => {
    const changeType = changeToType(change);

    if (changeType === CHANGE_NONE && !hunkOpen) {
      // HUNK START
      lastChangeLines(change, contextLines).forEach(line => {
        contextualRingInsert([CHANGE_NONE, line]);
      });

      // If this is the first change the diff starts with leading unchanged
      // lines - if those exceed the context length, ensure the output will
      // relfect that lines were skipped.
      if (changeIndex === 0 && change.count > contextLines) {
        outputter(CHANGE_MARKER);
      }
    }

    if (changeType === CHANGE_NONE && hunkOpen) {
      // HUNK END
      firstChangeLines(change, contextLines).forEach(line => {
        outputter(CHANGE_NONE, line);
      });

      hunkOpen = false;

      if (change.count > contextLines) {
        // make the unique bit of the change count towards context
        lastChangeLines(change, contextLines).forEach(line => {
          contextualRingInsert([CHANGE_NONE, line]);
        });
      } else {
        // empty the ring buffer to avoid duplicated context
        contextualRingIndex = -1;
        contextualRingInserted = 0;
      }

      // If this is the last change the diff ends with trailing unchanged
      // lines - if those exceed the context length, ensure the output will
      // relfect that more lines will be skipped.
      if (changeIndex === changes.length - 1 && change.count > contextLines) {
        outputter(CHANGE_MARKER);
      }
    }

    if (changeType === CHANGE_ADDED || changeType === CHANGE_REMOVED) {
      if (!hunkOpen) {
        if (hunkCount > 0) {
          outputter(CHANGE_MARKER);
        }

        hunkCount += 1;
        hunkOpen = true;

        let lastFromIndex;
        let emptyFromIndex;
        if (contextualRingInserted >= contextLines) {
          // The ring buffer was completely filled.

          // empty ring buffer from the oldest entry
          lastFromIndex = (contextualRingIndex + 1) % contextLines;
          emptyFromIndex = (lastFromIndex + 1) % contextLines;

          // output the first entry
          outputter(...contextualRingBuffer[lastFromIndex]);
        } else if (contextualRingIndex > -1) {
          // The ring buffer was only partially filled.
          emptyFromIndex = 0;
          lastFromIndex = contextualRingIndex + 1;
        } else {
          // The ring buffer was empty so force a noop.
          lastFromIndex = 0;
          emptyFromIndex = 0;
        }

        while (emptyFromIndex !== lastFromIndex) {
          outputter(...contextualRingBuffer[emptyFromIndex]);

          emptyFromIndex = (emptyFromIndex + 1) % contextLines;
        }
      }

      allChangeLines(change).forEach((line, index) => {
        const outputChangeType = change.replaced
          ? changeTypeToHighlight[changeType]
          : changeType;

        outputter(outputChangeType, line);
      });
    }
  });
};
