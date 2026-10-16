package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		word1, word2 string
		expected     int
	}{{"kitten", "sitting", 3}, {"sunday", "saturday", 3}, {"abc", "", 3}, {"", "abc", 3}, {"", "", 0}, {"same", "same", 0},
		{"a", "b", 1}, {"abcdef", "azced", 3}, {"ab", "ba", 2}, {"abcabcabc", "cba", 6},
		{strings.Repeat("a", 500), strings.Repeat("b", 500), 500}, {strings.Repeat("ab", 250), strings.Repeat("ba", 250), 2},
		{strings.Repeat("x", 300), strings.Repeat("x", 500), 200}}
	failed := false
	for n, c := range cases {
		if got := minDistance(c.word1, c.word2); got != c.expected {
			fmt.Printf("case %d: expected %d, got %d\n", n, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
