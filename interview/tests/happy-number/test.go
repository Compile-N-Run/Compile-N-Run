package main

import (
	"fmt"
	"math"
	"os"
)

func main() {
	cases := []struct {
		n        int
		expected bool
	}{{7, true}, {4, false}, {1, true}, {100, true}, {2, false}, {math.MaxInt32, false}, {1111111, true}, {999999999, false}}
	failed := false
	for _, c := range cases {
		if got := isHappy(c.n); got != c.expected {
			fmt.Println("n =", c.n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	// Every number up to 100, compared with the known list of happy numbers.
	happy := map[int]bool{}
	for _, v := range []int{1, 7, 10, 13, 19, 23, 28, 31, 32, 44, 49, 68, 70, 79, 82, 86, 91, 94, 97, 100} {
		happy[v] = true
	}
	for n := 1; n <= 100; n++ {
		if got := isHappy(n); got != happy[n] {
			fmt.Println("n =", n, "expected", happy[n], "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
