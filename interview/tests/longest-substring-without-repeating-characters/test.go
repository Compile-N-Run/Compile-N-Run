package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	alphabet := "abcdefghijklmnopqrstuvwxyz"
	cases := []struct {
		s        string
		expected int
	}{{"xyzxab", 5}, {"abba", 2}, {"zzzz", 1}, {"", 0}, {"a b!a", 4}, {"dvdf", 3}, {"tmmzuxt", 5},
		{"q", 1}, {"01234567890", 10}, {strings.Repeat(alphabet, 2000), 26}, {strings.Repeat("a", 30000) + alphabet, 26}}
	failed := false
	for _, c := range cases {
		if got := lengthOfLongestSubstring(c.s); got != c.expected {
			fmt.Printf("%q: expected %d, got %d\n", c.s[:min(20, len(c.s))], c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
