package main

import (
	"fmt"
	"os"
	"strings"
)

func reverse(s string) string {
	b := []byte(s)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	return string(b)
}

func main() {
	half := strings.Repeat("ab", 2500)
	mirror := half + reverse(half) // a 10,000-character palindrome
	cases := []struct {
		s        string
		expected bool
	}{
		{"abca", true},
		{"acba", true},
		{"abc", false},
		{"racecar", true},
		{"abcdba", true},
		{"a", true},
		{"ab", true},
		{"aba", true},
		{"abba", true},
		{"abcca", true},
		{"accba", true},
		{"abcdedcbaq", true},
		{"xabcdedcby", false},
		{"deeee", true},
		{"eedcfee", false},
		{"compilexnrunnurnelipmoc", true},
		{"compilexnrunnurnelipmyoc", false},
		{mirror, true},
		{half + "z" + reverse(half), true},
		{"z" + mirror, true},
		{mirror + "z", true},
		{strings.Repeat("ab", 5000), true},
		{mirror[:2500] + "zq" + mirror[2500:], false},
		{mirror[:100] + "z" + mirror[100:200] + "q" + mirror[200:], false},
	}
	failed := false
	for n, c := range cases {
		if got := validPalindrome(c.s); got != c.expected {
			label := c.s
			if len(c.s) > 40 {
				label = fmt.Sprintf("%s...%s (%d chars)", c.s[:12], c.s[len(c.s)-12:], len(c.s))
			}
			fmt.Printf("case %d %s: expected %v, got %v\n", n, label, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
