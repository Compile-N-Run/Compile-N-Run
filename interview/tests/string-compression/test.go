package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := [][2]string{{"xxxyzz", "x3yz2"}, {"q", "q"}, {strings.Repeat("m", 12), "m12"}, {"abba", "ab2a"},
		{"##@@@1111", "#2@314"}, {strings.Repeat("z", 10), "z10"}, {"ab", "ab"}, {"11122", "1322"},
		{strings.Repeat("a", 1000) + "b" + strings.Repeat("c", 100), "a1000bc100"}}
	failed := false
	for _, c := range cases {
		chars := []byte(c[0])
		n := compress(chars)
		if n != len(c[1]) || n > len(chars) || string(chars[:n]) != c[1] {
			fmt.Println(c[0], "expected", c[1], "got length", n)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
