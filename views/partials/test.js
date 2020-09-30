const keysMatch = function(obj1, obj2, keys) {
  for (const key of keys) {
    const obj1Val = obj1[key];
    const obj2Val = obj2[key];

    if (obj1Val !== obj2Val) return false;
  }

  return true;
};

keysMatch({a: 1, b: 2}, {a: 1}, ['a']);
keysMatch({a: 1, b: 2}, {a: 1}, ['a', 'b']);
keysMatch({a: 1, b: 2}, {a: 1}, ['a', 'c']);
