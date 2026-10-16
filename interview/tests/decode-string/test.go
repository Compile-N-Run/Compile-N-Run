package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := [][2]string{{"2[ab]c", "ababc"}, {"3[x2[y]]", "xyyxyyxyy"}, {"a10[b]", "abbbbbbbbbb"}, {"pq", "pq"},
		{"3[a]2[bc]", "aaabcbc"}, {"2[abc]3[cd]ef", "abcabccdcdcdef"}, {"1[z]", "z"},
		{"2[a3[b4[c]]]d", "abccccbccccbccccabccccbccccbccccd"}, {"300[a]", strings.Repeat("a", 300)},
		{"10[10[10[ab]]]", strings.Repeat("ab", 1000)}, {"x2[y3[z]]w", "xyzzzyzzzw"}}
	failed := false
	for _, c := range cases {
		if got := decodeString(c[0]); got != c[1] {
			fmt.Println(c[0], "expected", c[1], "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
