const extend = require('./utils').extend;

function isFlag(token) {
  return token.slice(0, 1) === '[' && token.slice(-1) === ']';
}
function isAlternation(token) {
  return token.slice(0, 1) === '(' && token.slice(-1) === ')';
}
function removeEmptyStrings(texts) {
  return texts.filter(text => text !== '');
}
function createPermutations(tokens, index) {
  if (index === tokens.length) {
    return [{ text: '', flags: {}, alternations: [] }];
  }

  const token = tokens[index];
  const tail = createPermutations(tokens, index + 1);
  if (isFlag(token)) {
    const flag = token.slice(1, -1);
    return tail
      .map(pattern => {
        const flags = {};
        flags[flag] = true;
        return {
          text: `${flag} ${pattern.text}`,
          flags: extend(flags, pattern.flags),
          alternations: pattern.alternations
        };
      })
      .concat(
        tail.map(pattern => {
          const flags = {};
          flags[flag] = false;
          return {
            text: pattern.text,
            flags: extend(flags, pattern.flags),
            alternations: pattern.alternations
          };
        })
      );
  } else if (isAlternation(token)) {
    return token
      .substr(1, token.length - 2) // Remove parentheses
      .split(/\|/)
      .reduce(
        (result, alternation) =>
          result.concat(
            tail.map(({ text, flags, alternations }) => ({
              // Make sure that an empty alternation doesn't produce two spaces:
              text: alternation ? alternation + text : text.replace(/^ /, ''),

              flags,
              alternations: [alternation, ...alternations]
            }))
          ),
        []
      );
  } else {
    return tail.map(({ text, flags, alternations }) => ({
      text: token + text,
      flags,
      alternations
    }));
  }
}

function expandAssertion(pattern) {
  pattern = pattern.replace(/(\[[^\]]+\]) ?/g, '$1');
  const splitRegex = /\[[^\]]+\]|\([^)]+\)/g;
  let tokens = [];
  let m;
  let lastIndex = 0;
  while ((m = splitRegex.exec(pattern))) {
    tokens.push(pattern.slice(lastIndex, m.index));
    tokens.push(pattern.slice(m.index, splitRegex.lastIndex));
    lastIndex = splitRegex.lastIndex;
  }
  tokens.push(pattern.slice(lastIndex));
  tokens = removeEmptyStrings(tokens);
  const permutations = createPermutations(tokens, 0);
  permutations.forEach(permutation => {
    permutation.text = permutation.text.trim();
    if (permutation.text === '') {
      // This can only happen if the pattern only contains flags
      throw new Error('Assertion patterns must not only contain flags');
    }
  });
  return permutations;
}

module.exports = expandAssertion;
