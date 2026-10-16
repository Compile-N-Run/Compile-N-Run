package main

import (
	"fmt"
	"os"
	"strings"
)

func isPalindrome(s string) bool {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		if s[i] != s[j] {
			return false
		}
	}
	return true
}

func main() {
	// Larger case: 990 letters cycling through the alphabet (no palindrome longer than 1)
	// with a 10-character palindrome inserted in the middle.
	var sb strings.Builder
	for i := 0; i < 990; i++ {
		sb.WriteByte(byte('a' + i%26))
	}
	alpha := sb.String()
	big := alpha[:500] + "1234554321" + alpha[500:]
	cases := []struct {
		s      string
		length int
	}{{"xracecarz", 7}, {"abbc", 2}, {"pqr", 1}, {"aaaa", 4}, {"a", 1}, {"Aa", 1},
		{"abacdfgdcaba", 3}, {"ab12321ba", 9}, {big, 10}}
	failed := false
	for _, c := range cases {
		got := longestPalindrome(c.s)
		if len(got) != c.length || !isPalindrome(got) || !strings.Contains(c.s, got) {
			fmt.Println(c.s[:min(20, len(c.s))], "expected length", c.length, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
