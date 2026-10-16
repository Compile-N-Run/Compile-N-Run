for (const [s, p, expected] of [['abb', 'c*ab*', true], ['hello', 'h.l*o', true], ['ab', 'a', false], ['aaa', 'ab*a', false], ['abc', '.*', true], ['', 'x*y*', true], ['', '.', false], ['a', 'ab*', true], ['xy', '.*z', false], ['ab', '.*c', false], ['aaaaaaaaaaaaaaaaaab', 'a*a*a*a*a*a*a*c', false], ['aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 'a*a*a*a*a*a*a*a*a*a*a', true], ['mnop', 'm.*p.*', true]]) {
  check(isMatch(s, p), expected, `"${s}" "${p}"`);
}
