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
	}{{"stress", 1}, {"racecar", 3}, {"aabbcc", -1}, {"x", 0}, {"zzyzx", 2}, {"abcabc", -1}, {"abba", -1}, {"zza", 2},
		{"abcdefghijklmnopqrstuvwxyz", 0}, {strings.Repeat("ab", 5000) + "q", 10000}, {strings.Repeat("a", 100000), -1},
		{"q" + strings.Repeat("ab", 5000), 0}}
	failed := false
	for _, c := range cases {
		if got := firstUniqChar(c.s); got != c.expected {
			fmt.Printf("%q: expected %d, got %d\n", c.s[:min(12, len(c.s))], c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
