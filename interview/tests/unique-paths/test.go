package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct{ m, n, expected int }{
		{1, 1, 1},
		{2, 2, 2},
		{3, 2, 3},
		{1, 10, 1},
		{100, 1, 1},
		{4, 4, 20},
		{3, 7, 28},
		{7, 3, 28},
		{5, 5, 70},
		{10, 10, 48620},
		{16, 16, 155117520},
		{23, 12, 193536720},
		{51, 9, 1916797311}, // the largest answers still fit in a 32-bit int
	}
	failed := false
	for _, c := range cases {
		if got := uniquePaths(c.m, c.n); got != c.expected {
			fmt.Println("m =", c.m, "n =", c.n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
