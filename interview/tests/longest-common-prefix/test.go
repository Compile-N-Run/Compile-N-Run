package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	// Larger case: 200 words of 200 characters that share their first 150 characters.
	big := []string{}
	for i := 0; i < 200; i++ {
		big = append(big, strings.Repeat("k", 150)+strings.Repeat(string(rune('a'+i%26)), 50))
	}
	cases := []struct {
		strs     []string
		expected string
	}{{[]string{"interview", "internet", "interval"}, "inter"}, {[]string{"apple", "banana"}, ""},
		{[]string{"code", "coder", "co"}, "co"}, {[]string{"solo"}, "solo"}, {[]string{""}, ""}, {[]string{"abc", ""}, ""},
		{[]string{"same", "same", "same"}, "same"}, {[]string{"prefix", "pre", "prelude", "prey"}, "pre"},
		{big, strings.Repeat("k", 150)}}
	failed := false
	for _, c := range cases {
		if got := longestCommonPrefix(append([]string(nil), c.strs...)); got != c.expected {
			fmt.Printf("%d words: expected %q, got %q\n", len(c.strs), c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
