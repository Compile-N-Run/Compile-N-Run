package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s           string
		k, expected int
	}{
		{"AABCA", 1, 3},
		{"AABCA", 2, 5},
		{"ABBBAA", 1, 4},
		{"XYZ", 0, 1},
		{"BBBB", 0, 4},
		{"ABAB", 2, 4},
		{"AAABBB", 1, 4},
		{"A", 5, 1},
		{"ABCDE", 2, 3},
		{"AABBCC", 2, 4},
		{strings.Repeat("A", 5000) + strings.Repeat("B", 5000), 100, 5100},
		{strings.Repeat("AB", 5000), 0, 1},
		{strings.Repeat("AB", 5000), 5000, 10000},
	}
	failed := false
	for n, c := range cases {
		if got := characterReplacement(c.s, c.k); got != c.expected {
			fmt.Printf("case %d (n=%d) k=%d: expected %d, got %d\n", n, len(c.s), c.k, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
