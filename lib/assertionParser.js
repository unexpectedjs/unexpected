function parseType(str) {
    return str.split('|').map(function (typeDeclaration) {
        var varargs = /^\.\.\./.test(typeDeclaration);
        if (varargs) {
            return { varargs: typeDeclaration.substr(3) };
        } else {
            return typeDeclaration;
        }
    });
}

function hasVarargs(types) {
    return types.some(function (type) {
        return type.varargs;
    });
}

module.exports = function assertionParser(str) {
    var tokens = [];
    var nextIndex = 0;
    str.replace(/\s*<((?:(?:\.\.\.)?[a-z_](?:|[a-z0-9_.-]*[_a-z0-9]))(?:|(?:(?:\.\.\.)?[a-z_](?:\|[a-z0-9_.-]*[_a-z0-9])))?)>|\s*([^<]+)/g, function ($0, $1, $2, index) {
        if (index !== nextIndex) {
            throw new SyntaxError('Cannot parse token at index ' + nextIndex);
        }
        if ($1) {
            tokens.push(parseType($1));
        } else {
            tokens.push($2.trim());
        }
        nextIndex += $0.length;
    });
    var result = {
        subject: tokens[0],
        assertion: tokens[1],
        args: tokens.slice(2)
    };
    if (!Array.isArray(result.subject)) {
        throw new SyntaxError('Missing subject type');
    }
    if (typeof result.assertion !== 'string')  {
        throw new SyntaxError('Missing assertion');
    }
    if (hasVarargs(result.subject)) {
        throw new SyntaxError('The subject type cannot have varargs');
    }
    if (result.args.some(function (type, i) {return i < result.args.length - 1 && hasVarargs(type);})) {
        throw new SyntaxError('Only the last argument type can have varargs');
    }
    return result;
};
