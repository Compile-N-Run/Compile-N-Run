package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s        string
		expected bool
	}{{"([]{})", true}, {"([)]", false}, {"((", false}, {"}", false}, {"()[]{}", true}, {")(", false},
		{"{[()()]}", true}, {"[", false}, {"(]", false},
		{strings.Repeat("{[(", 3000) + strings.Repeat(")]}", 3000), true},
		{strings.Repeat("(", 5000) + strings.Repeat(")", 4999), false}}
	failed := false
	for _, c := range cases {
		if got := isValid(c.s); got != c.expected {
			fmt.Printf("%.20s: expected %v, got %v\n", c.s, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
