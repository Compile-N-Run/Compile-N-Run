package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	chain := "1" + strings.Repeat("+1", 4999) // 1+1+...+1
	deep := strings.Repeat("(", 2000) + "1" + strings.Repeat(")", 2000)
	cases := []struct {
		s        string
		expected int
	}{{"12 - 5 + 3", 10}, {"2-(5-6)", 3}, {"(1+(4+5+2)-3)+(6+8)", 23}, {"-(2+3)", -5}, {"1-(2-(3-(4-5)))", 3}, {"  42  ", 42},
		{"(  (7) )", 7}, {"1-(-1)", 2}, {"0", 0}, {"2147483647", 2147483647}, {"10 - 100", -90}, {"- (3 + (4 + 5))", -12},
		{"123+45-678", -510}, {"(0-2147483647)-1", -2147483648}, {chain, 5000}, {deep, 1}, {"-" + deep + "+(" + chain + ")", 4999}}
	failed := false
	for _, c := range cases {
		if got := calculate(c.s); got != c.expected {
			fmt.Printf("%q: expected %d, got %d\n", c.s[:min(24, len(c.s))], c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
