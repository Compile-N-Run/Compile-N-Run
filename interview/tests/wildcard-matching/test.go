package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s, p     string
		expected bool
	}{
		{"adceb", "*a*b", true},
		{"acdcb", "a*c?b", false},
		{"cb", "?a", false},
		{"", "**", true},
		{"abc", "", false},
		{"aa", "a", false},
		{"aa", "*", true},
		{"", "", true},
		{"", "?", false},
		{"abc", "abc", true},
		{"abc", "a?c", true},
		{"a", "a*", true},
		{"ho", "**ho", true},
		{"mississippi", "m??*ss*?i*pi", false},
		{"abefcdgiescdfimde", "ab*cd?i*de", true},
		{strings.Repeat("a", 2000) + "b", "*a", false},
		{strings.Repeat("a", 1000) + "b", "*a*b", true},
		{strings.Repeat("a", 2000), strings.Repeat("*", 50) + "b", false},
		{strings.Repeat("a", 2000), strings.Repeat("*a", 100) + "*", true}, // many stars that must each stretch
	}
	failed := false
	for _, c := range cases {
		got := isMatch(c.s, c.p)
		if got != c.expected {
			s, p := c.s, c.p
			if len(s) > 10 {
				s = s[:10] + "..."
			}
			if len(p) > 12 {
				p = p[:12] + "..."
			}
			fmt.Printf("%q (length %d) against %q: expected %v, got %v\n", s, len(c.s), p, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
