package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s        string
		k        int
		expected string
	}{
		{"abbbacd", 3, "aacd"},
		{"abbbaac", 3, "c"},
		{"aabbccbba", 2, "a"},
		{"xyz", 2, "xyz"},
		{"aaaa", 3, "a"},
		{"abcd", 2, "abcd"},
		{"deeedbbcccbdaa", 3, "aa"},
		{"pbbcggttciiippooaais", 2, "ps"},
		{"aaa", 3, ""},
		{"aa", 3, "aa"},
		{"yfttttfbbbbnnnnffbgffffgbbbbgssssgthyyyy", 4, "ybth"},
		{"a", 2, "a"},
		{strings.Repeat("a", 10000), 10, ""},
		{strings.Repeat("a", 10001), 10, "a"},
		{strings.Repeat("ab", 5000), 2, strings.Repeat("ab", 5000)},
	}
	failed := false
	for _, c := range cases {
		if got := removeDuplicates(c.s, c.k); got != c.expected {
			fmt.Printf("removeDuplicates(%.16s, %d): expected %.20s, got %.20s\n", c.s, c.k, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
