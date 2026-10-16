package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	grid := []string{"CAT", "ORE", "DOG"}
	snake := []string{"ABCDEF", "LKJIHG", "MNOPQR", "XWVUTS", "YZABCD", "JIHGFE"}
	flat := []string{"AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA", "AAAAAA"}
	cases := []struct {
		rows     []string
		word     string
		expected bool
	}{{grid, "CARE", true}, {grid, "DOGE", true}, {grid, "CODE", false}, {grid, "CAC", false}, {grid, "TAR", true},
		{grid, "CATERODOG", true}, {[]string{"a"}, "a", true}, {[]string{"a"}, "b", false}, {[]string{"ab"}, "aba", false},
		{[]string{"ab", "cd"}, "abdc", true}, {[]string{"ab", "cd"}, "ad", false}, {snake, "ABCDEFGHIJKLMNO", true},
		{snake, "ABCDEFGHIJKLMNQ", false}, {flat, "AAAAAAAAAB", false}, {flat, strings.Repeat("A", 15), true}}
	failed := false
	for _, c := range cases {
		board := [][]byte{}
		for _, row := range c.rows {
			board = append(board, []byte(row))
		}
		if got := exist(board, c.word); got != c.expected {
			fmt.Println(c.rows, c.word, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
