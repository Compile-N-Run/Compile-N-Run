package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	letters := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	var bigB, evens, odds strings.Builder
	for i := 0; i < 2000; i++ {
		c := strings.ToLower(string(letters[i%26]))
		bigB.WriteString(c)
		if i%2 == 0 {
			evens.WriteString(c)
		} else {
			odds.WriteString(c)
		}
	}
	big := bigB.String()
	cases := []struct {
		s        string
		numRows  int
		expected string
	}{
		{"ABCDEFGHIJ", 3, "AEIBDFHJCG"},
		{"ABCD", 2, "ACBD"},
		{"HELLO", 1, "HELLO"},
		{"AB", 5, "AB"},
		{"ABCDEFGH", 7, "ABCDEFHG"},
		{"ABCDEFG", 7, "ABCDEFG"},
		{"A", 1, "A"},
		{"A", 3, "A"},
		{letters, 4, "AGMSYBFHLNRTXZCEIKOQUWDJPV"},
		{letters, 5, "AIQYBHJPRXZCGKOSWDFLNTVEMU"},
		{"a.b,c d", 2, "abcd., "},             // punctuation and spaces are ordinary characters
		{big, 2, evens.String() + odds.String()}, // two rows: every other character, then the rest
		{big, 2000, big},                        // as many rows as characters: unchanged
		{big, 1, big},
	}
	failed := false
	for _, c := range cases {
		got := convert(c.s, c.numRows)
		if got != c.expected {
			head := c.s
			if len(head) > 12 {
				head = head[:12] + "..."
			}
			fmt.Printf("s=%q numRows=%d: expected %q, got %q\n", head, c.numRows, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
