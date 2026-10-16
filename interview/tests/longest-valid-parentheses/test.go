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
	}{{"())((())", 4}, {"(()()", 4}, {"()(())", 6}, {")(", 0}, {"", 0}, {"((((", 0}, {"()(()", 2},
		{")()())()()(", 4}, {"()", 2},
		{"(" + strings.Repeat("()", 5000) + "))", 10002}, {strings.Repeat("()", 3000) + "(" + strings.Repeat("()", 2000), 6000}}
	failed := false
	for _, c := range cases {
		if got := longestValidParentheses(c.s); got != c.want {
			fmt.Printf("%q: expected %d, got %d\n", c.s[:min(20, len(c.s))], c.want, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
