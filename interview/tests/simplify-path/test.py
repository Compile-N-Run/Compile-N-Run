from solution import *

big = '/' + '/'.join(f'd{i}/./e{i}//..' for i in range(500)) + '/../'  # leaves d0..d498
cases = [('/docs/./drafts//final/', '/docs/drafts/final'), ('/a/b/../../c', '/c'), ('/../..', '/'), ('/x/.../y/..', '/x/...'),
         ('/', '/'), ('///', '/'), ('/home/', '/home'), ('/a/./b/./c/.', '/a/b/c'), ('/.hidden/..../_x/', '/.hidden/..../_x'),
         ('/a/..', '/'), (big, '/' + '/'.join(f'd{i}' for i in range(499)))]
for path, expected in cases:
    check(Solution().simplifyPath(path), expected, path[:40])
