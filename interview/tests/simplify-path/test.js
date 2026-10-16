const parts = [], kept = [];
for (let i = 0; i < 500; i++) { parts.push(`d${i}/./e${i}//..`); if (i < 499) kept.push(`d${i}`); }
for (const [path, expected] of [['/docs/./drafts//final/', '/docs/drafts/final'], ['/a/b/../../c', '/c'], ['/../..', '/'],
  ['/x/.../y/..', '/x/...'], ['/', '/'], ['///', '/'], ['/home/', '/home'], ['/a/./b/./c/.', '/a/b/c'],
  ['/.hidden/..../_x/', '/.hidden/..../_x'], ['/a/..', '/'], ['/' + parts.join('/') + '/../', '/' + kept.join('/')]]) {
  check(simplifyPath(path), expected, path.slice(0, 40));
}
