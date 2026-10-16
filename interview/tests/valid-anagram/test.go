package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	var b strings.Builder
	for i := 0; i < 50000; i++ {
		b.WriteByte(byte('a' + i%26))
	}
	bigS := b.String()
	rev := []byte(bigS)
	for i, j := 0, len(rev)-1; i < j; i, j = i+1, j-1 {
		rev[i], rev[j] = rev[j], rev[i]
	}
	bigT := string(rev)
	cases := []struct {
		s, t     string
		expected bool
	}{{"listen", "silent", true}, {"bell", "bel", false}, {"aab", "abb", false}, {"x", "x", true},
		{"a", "b", false}, {"anagram", "nagaram", true}, {"abc", "abcc", false}, {"zzzz", "zzzz", true},
		{bigS, bigT, true}, {bigS, bigT[:len(bigT)-1] + "q", false}}
	failed := false
	for _, c := range cases {
		if got := isAnagram(c.s, c.t); got != c.expected {
			fmt.Printf("%.20s %.20s: expected %v, got %v\n", c.s, c.t, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
