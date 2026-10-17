package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		s        string
		expected int
	}{
		{"12", 2},
		{"226", 3},
		{"06", 0},
		{"2101", 1},
		{"27", 1},
		{"0", 0},
		{"1", 1},
		{"10", 1},
		{"100", 0},
		{"230", 0},
		{"11106", 2},
		{"1000", 0},
		{strings.Repeat("12", 10), 10946},
		{strings.Repeat("1", 40), 165580141}, // 41st Fibonacci number
		{strings.Repeat("10", 500), 1},       // every "10" must be taken as a pair
		{strings.Repeat("27", 500), 1},       // "27" is never a pair
		{strings.Repeat("9", 1000), 1},
	}
	failed := false
	for _, c := range cases {
		got := numDecodings(c.s)
		if got != c.expected {
			short := c.s
			if len(short) > 12 {
				short = short[:12] + "..."
			}
			fmt.Printf("%q (length %d): expected %d, got %d\n", short, len(c.s), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
