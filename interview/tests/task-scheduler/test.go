package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	alphabet := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	cases := []struct {
		tasks       string
		n, expected int
	}{{"AAABBB", 2, 8}, {"AAABBB", 0, 6}, {"AAAAAABCDEFG", 2, 16}, {"ABCD", 5, 4}, {"A", 5, 1}, {"AAAA", 1, 7},
		{"AABBCC", 1, 6}, {"AAB", 2, 4}, {"AAABBBCCC", 2, 9}, {"AAABBBCC", 3, 10}, {"ZZZZZZZZZZ", 0, 10},
		{strings.Repeat("A", 10000) + strings.Repeat("B", 10000), 50, 9999*51 + 2}, {strings.Repeat(alphabet, 400), 1, 10400},
		{strings.Repeat("Q", 1000), 100, 999*101 + 1}}
	failed := false
	for _, c := range cases {
		if got := leastInterval([]byte(c.tasks), c.n); got != c.expected {
			fmt.Printf("%q n=%d: expected %d, got %d\n", c.tasks[:min(12, len(c.tasks))], c.n, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
