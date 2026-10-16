package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s    string
		want int
	}{{"aba", 4}, {"aaaa", 10}, {"abba", 6}, {"abcd", 4}, {"x", 1}, {"racecar", 10}, {"zz", 3},
		{strings.Repeat("a", 1000), 500500}, {strings.Repeat("ab", 500), 250500}}
	failed := false
	for _, c := range cases {
		if got := countSubstrings(c.s); got != c.want {
			fmt.Printf("%s: expected %d, got %d\n", c.s[:min(20, len(c.s))], c.want, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
