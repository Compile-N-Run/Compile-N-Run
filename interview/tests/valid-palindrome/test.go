package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	half := strings.Repeat("Ab1, ", 20000)
	b := []byte(half)
	for i, j := 0, len(b)-1; i < j; i, j = i+1, j-1 {
		b[i], b[j] = b[j], b[i]
	}
	rev := string(b)
	cases := []struct {
		s        string
		expected bool
	}{{"Step on no pets!", true}, {"Top spot 1", false}, {"?! .", true}, {"ab2a", false}, {"a", true},
		{"Aa", true}, {"0P", false}, {"No 'x' in Nixon", true}, {half + "#" + rev, true}, {half + "x" + rev + "z", false}}
	failed := false
	for i, c := range cases {
		if got := isPalindrome(c.s); got != c.expected {
			fmt.Println("case", i, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
