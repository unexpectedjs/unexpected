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
  return lastChangeLines(change, Infinity);
}

function firstChangeLines(change, maxLines) {
  const includeCount = Math.min(maxLines, change.count);
  const lines = change.value.split('\n');

  return lines.slice(0, includeCount);
}

function lastChangeLines(change, maxLines) {
  let value = change.value;

  // discard a trailing newline
  if (lastChar(value) === '\n') {
    value = value.slice(0, -1);
  }

  const lines = value.split('\n');

  if (maxLines === Infinity) {
    return lines;
  }

  const includeCount = Math.min(maxLines, change.count);
  return lines.slice(lines.length - includeCount, lines.length);
}

function lastChar(str) {
  return str ? str[str.length - 1] : '';
}

function markupReplacementsInDiff(changes) {
  let lastPart = {};

  changes.forEach((part, partIndex) => {
    if (!(lastPart.removed && part.added)) {
      lastPart = part;
      return;
    }

    lastPart.replaced = true;
    part.replaced = true;

    if (lastChar(lastPart.value) === '\n' && lastChar(part.value) === '\n') {
      lastPart.value = lastPart.value.slice(0, -1);
      part.value = part.value.slice(0, -1);
    }

    lastPart = part;
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

      const matchTrailingNewlines = change.value.match(/[\n]+$/);
      const countTrailingNewlines = matchTrailingNewlines
        ? matchTrailingNewlines[0].length
        : 0;
      if (countTrailingNewlines > 0) {
        change.value = change.value.slice(0, -countTrailingNewlines);
      }
      if (change.value === '') {
        outputter(changeType, '', { trailingNewline: false });
        return;
      }

      const lines = allChangeLines(change);
      lines.forEach((line, lineIndex) => {
        const outputChangeType = change.replaced
          ? changeTypeToHighlight[changeType]
          : changeType;

        outputter(outputChangeType, line);

        if (
          changeType !== '=' &&
          line !== '' &&
          countTrailingNewlines > 0 &&
          (changeIndex === changes.length - 1 || change.replaced) &&
          lineIndex === lines.length - 1
        ) {
          outputter(outputChangeType, '', {
            forceHighlight: true,
            leadingNewline: false,
            trailingNewline: false
          });
        }
      });
    }
  });
};
