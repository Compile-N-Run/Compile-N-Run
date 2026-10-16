package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	zeros, nines := strings.Repeat("0", 500), strings.Repeat("9", 300)
	cases := []struct {
		s        string
		expected int
	}{
		{"   -17abc", -17},
		{"+0042", 42},
		{"words 9", 0},
		{"  +-3", 0},
		{"3.14", 3},
		{"-91283472332", -2147483648},
		{"99999999999", 2147483647},
		{"", 0},
		{"   ", 0},
		{"-", 0},
		{"+", 0},
		{"-0", 0},
		{"- 5", 0},
		{"  12 34", 12},
		{"2147483647", 2147483647},
		{"2147483648", 2147483647},
		{"-2147483648", -2147483648},
		{"-2147483647", -2147483647},
		{zeros + "7", 7},
		{"-" + zeros + "2147483648", -2147483648},
		{nines, 2147483647},
		{"-" + nines + "x", -2147483648},
	}
	failed := false
	for n, c := range cases {
		if got := myAtoi(c.s); got != c.expected {
			fmt.Printf("case %d %q (n=%d): expected %d, got %d\n", n, c.s[:min(len(c.s), 16)], len(c.s), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
