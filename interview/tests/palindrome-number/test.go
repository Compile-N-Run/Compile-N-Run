package main

import (
	"fmt"
	"os"
)

func main() {
	cases := []struct {
		x        int
		expected bool
	}{{1331, true}, {12321, true}, {-44, false}, {50, false}, {0, true}, {7, true}, {10, false},
		{1000021, false}, {1000000001, true}, {2147447412, true}, {2147483647, false}, {-2147483648, false}}
	failed := false
	for _, c := range cases {
		if got := isPalindrome(c.x); got != c.expected {
			fmt.Println(c.x, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
