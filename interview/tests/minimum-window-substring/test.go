package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	b := []byte(strings.Repeat("x", 100000))
	b[10], b[30000], b[30005], b[30010] = 'a', 'a', 'c', 'b'
	big := string(b)
	cases := []struct{ s, t, expected string }{{"thequickfox", "qf", "quickf"}, {"abacab", "aab", "aba"}, {"abc", "aa", ""},
		{"a", "ab", ""}, {"a", "a", "a"}, {"Aa", "a", "a"}, {"Aa", "A", "A"}, {"abc", "d", ""}, {"MXNOYXMN", "MN", "MN"},
		{"aaflslflsldkalskaaa", "aaa", "aaa"}, {big, "abc", big[30000:30011]}}
	failed := false
	for _, c := range cases {
		if got := minWindow(c.s, c.t); got != c.expected {
			fmt.Printf("%.20s %s: expected %q, got %.40q\n", c.s, c.t, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
