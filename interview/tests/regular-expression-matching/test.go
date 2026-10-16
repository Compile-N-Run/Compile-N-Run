package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		s, p     string
		expected bool
	}{{"abb", "c*ab*", true}, {"hello", "h.l*o", true}, {"ab", "a", false}, {"aaa", "ab*a", false}, {"abc", ".*", true}, {"", "x*y*", true}, {"", ".", false}, {"a", "ab*", true}, {"xy", ".*z", false}, {"ab", ".*c", false}, {"aaaaaaaaaaaaaaaaaab", "a*a*a*a*a*a*a*c", false}, {"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "a*a*a*a*a*a*a*a*a*a*a", true}, {"mnop", "m.*p.*", true}}
	failed := false
	for _, c := range cases {
		if got := isMatch(c.s, c.p); got != c.expected {
			fmt.Printf("%q %q: expected %v, got %v\n", c.s, c.p, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
