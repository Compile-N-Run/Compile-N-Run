package main

import (
	"fmt"
	"os"
)

func main() {
	bigOk, bigStuck, bigLeap := make([]int, 10000), make([]int, 10000), make([]int, 10000)
	for i := range bigOk {
		bigOk[i], bigStuck[i] = 1, 1
	}
	bigStuck[5000] = 0
	bigLeap[0] = 10000
	cases := []struct {
		nums     []int
		expected bool
	}{{[]int{2, 0, 1, 0}, true}, {[]int{1, 1, 0, 2}, false}, {[]int{3, 0, 0, 0, 5}, false}, {[]int{0}, true},
		{[]int{5}, true}, {[]int{0, 1}, false}, {[]int{2, 3, 0, 0, 1}, true}, {[]int{4, 0, 0, 0, 0}, true},
		{[]int{1, 0, 1, 0}, false}, {bigOk, true}, {bigStuck, false}, {bigLeap, true}}
	failed := false
	for n, c := range cases {
		if got := canJump(append([]int(nil), c.nums...)); got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
