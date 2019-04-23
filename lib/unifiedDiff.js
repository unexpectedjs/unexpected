const CHANGE_ADDED = '+';
const CHANGE_REMOVED = '-';
const CHANGE_REPLACED = 's';
const CHANGE_MARKER = '~';
const CHANGE_NONE = '=';

function changeToType(change) {
  if (change.replaced) {
    return CHANGE_REPLACED;
  } else if (change.added) {
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

function markupReplacementsInDiff(diffChanges) {
  const changes = [];

  let lastPart = {};
  diffChanges.forEach(part => {
    if (!(lastPart.removed && part.added)) {
      lastPart = part;
      changes.push(part);
      return;
    }

    part.replaced = true;

    // remove the previous change
    changes.pop();

    changes.push({
      replaced: true,
      oldValue: lastPart.value,
      newValue: part.value
    });

    lastPart = part;
  });

  return changes;
}

module.exports = function(diffChanges, outputter, options = {}) {
  const contextLines = 3;

  const contextualRingBuffer = new Array(contextLines);
  let contextualRingIndex = -1;
  let contextualRingInserted = 0;
  function contextualRingInsert(line) {
    contextualRingIndex = (contextualRingIndex + 1) % contextLines;
    contextualRingBuffer[contextualRingIndex] = line;
    contextualRingInserted += 1;
  }

  let hunkCount = 0;
  let hunkOpen = false;

  const changes = markupReplacementsInDiff(diffChanges);
  const lastChangeIndex = changes.length - 1;
  changes.forEach((change, changeIndex) => {
    const changeType = changeToType(change);
    const changeInfo = { isLastChange: changeIndex === lastChangeIndex };

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
        outputter(CHANGE_NONE, line, changeInfo);
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

    if (
      changeType === CHANGE_ADDED ||
      changeType === CHANGE_REMOVED ||
      changeType === CHANGE_REPLACED
    ) {
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

      if (changeType === CHANGE_REPLACED) {
        outputter(changeType, change, changeInfo);
        return;
      }

      // TODO: the line is not broken up so that it is handled
      //       via existing stringDiff rendering code
      if (changes.length === 1) {
        return outputter(changeType, change.value, changeInfo);
      }

      const lines = allChangeLines(change);
      lines.forEach(line => {
        outputter(changeType, line, changeInfo);
      });
    }
  });
};
