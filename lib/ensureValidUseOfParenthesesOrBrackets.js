function ensureValidUseOfParenthesesOrBrackets(pattern) {
  const counts = {
    '[': 0,
    ']': 0,
    '(': 0,
    ')': 0
  };
  for (let i = 0; i < pattern.length; i += 1) {
    const c = pattern.charAt(i);
    if (c in counts) {
      counts[c] += 1;
    }
    if (c === ']' && counts['['] >= counts[']']) {
      if (counts['['] === counts[']'] + 1) {
        throw new Error(
          `Assertion patterns must not contain flags with brackets: '${pattern}'`
        );
      }

      if (counts['('] !== counts[')']) {
        throw new Error(
          `Assertion patterns must not contain flags with parentheses: '${pattern}'`
        );
      }

      if (pattern.charAt(i - 1) === '[') {
        throw new Error(
          `Assertion patterns must not contain empty flags: '${pattern}'`
        );
      }
    } else if (c === ')' && counts['('] >= counts[')']) {
      if (counts['('] === counts[')'] + 1) {
        throw new Error(
          `Assertion patterns must not contain alternations with parentheses: '${pattern}'`
        );
      }

      if (counts['['] !== counts[']']) {
        throw new Error(
          `Assertion patterns must not contain alternations with brackets: '${pattern}'`
        );
      }
    }
  }

  if (counts['['] !== counts[']']) {
    throw new Error(
      `Assertion patterns must not contain unbalanced brackets: '${pattern}'`
    );
  }

  if (counts['('] !== counts[')']) {
    throw new Error(
      `Assertion patterns must not contain unbalanced parentheses: '${pattern}'`
    );
  }
}

module.exports = ensureValidUseOfParenthesesOrBrackets;
