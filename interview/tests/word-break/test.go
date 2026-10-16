package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	aWords := []string{"a", "aa", "aaa", "aaaa", "aaaaa", "aaaaaaaaaa"}
	cases := []struct {
		s        string
		words    []string
		expected bool
	}{{"sunflower", []string{"sun", "flower", "flow"}, true}, {"hotdogs", []string{"hot", "dog", "hotdog"}, false},
		{"abab", []string{"ab"}, true}, {"applepie", []string{"apple", "app", "lepie"}, true},
		{"a", []string{"b"}, false}, {"a", []string{"a"}, true}, {"catcat", []string{"cats", "at"}, false},
		{"ab", []string{"abc"}, false}, {strings.Repeat("a", 299) + "b", aWords, false},
		{strings.Repeat("a", 300), aWords, true}, {strings.Repeat("ab", 150), []string{"a", "b", "ba"}, true}}
	failed := false
	for n, c := range cases {
		if got := wordBreak(c.s, append([]string(nil), c.words...)); got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
