// 'ok' when got is a valid rearrangement of s (or '' when none exists); otherwise what went wrong.
function reorganizeVerdict(s, got) {
  const counts = new Map();
  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);
  const possible = Math.max(...counts.values()) <= Math.floor((s.length + 1) / 2);
  if (got === '') return possible ? 'empty, but an arrangement exists' : 'ok';
  if (!possible) return 'not empty, but no arrangement exists';
  if ([...got].sort().join('') !== [...s].sort().join('')) return 'letters differ from the input';
  for (let i = 1; i < got.length; i++) if (got[i] === got[i - 1]) return 'two equal letters are adjacent';
  return 'ok';
}

const reorganizeCases = [
  'aab',
  'aaab',
  'vvvlo',
  'a',
  'aa',
  'ab',
  'aabb',
  'aaabbc',
  'aaaabbbccd',
  'zzzzzzyyyyxxww',
  'abcdefghijklmnopqrstuvwxyz',
  'a'.repeat(250) + 'b'.repeat(150) + 'c'.repeat(100), // 500 letters, exactly half of them a
  'a'.repeat(251) + 'b'.repeat(249), // impossible by one letter
];
for (const s of reorganizeCases) {
  const got = reorganizeString(s);
  const short = (t) => (t.length <= 30 ? t : `${t.slice(0, 12)}... (${t.length} letters)`);
  check(reorganizeVerdict(s, got), 'ok', `"${short(s)}" -> "${short(got)}"`);
}
