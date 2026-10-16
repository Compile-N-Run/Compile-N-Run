package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	big := strings.Repeat("7*3/2+", 4999) + "7*3/2" // 5000 terms of 10
	cases := []struct {
		s        string
		expected int
	}{{"3+4*2", 11}, {" 20 / 3 - 1 ", 5}, {"8-6/4*3", 5}, {"42", 42}, {"3-5/2", 1}, {"14-3/2", 13}, {"1-1+1", 1}, {"0*7", 0},
		{"2*3*4/5", 4}, {"  2147483647 ", 2147483647}, {"100 - 99 - 1", 0}, {big, 50000}}
	failed := false
	for _, c := range cases {
		if got := calculate(c.s); got != c.expected {
			fmt.Printf("%.20q expected %d got %d\n", c.s, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
