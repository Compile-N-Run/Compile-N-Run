package main

import (
	"fmt"
	"os"
)

func main() {
	// Each op is {0, timestamp, 0} for Hit or {1, timestamp, expected} for GetHits.
	cases := [][][3]int{
		{{0, 2, 0}, {0, 2, 0}, {0, 5, 0}, {1, 5, 3}, {1, 301, 3}, {1, 302, 1}, {1, 305, 0}},
		{{1, 1, 0}, {1, 100, 0}},
		{{0, 1, 0}, {1, 300, 1}, {1, 301, 0}},
		{{0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {0, 10, 0}, {1, 10, 5}, {1, 309, 5}, {1, 310, 0}},
		{{0, 1, 0}, {0, 100, 0}, {0, 250, 0}, {1, 350, 2}, {0, 400, 0}, {1, 400, 2}, {1, 549, 2}, {1, 550, 1}},
		{{1, 5, 0}, {0, 5, 0}, {1, 5, 1}, {0, 6, 0}, {0, 6, 0}, {1, 304, 3}, {1, 305, 2}, {1, 306, 0}},
	}
	big := [][3]int{}
	for t := 1; t <= 10000; t++ {
		big = append(big, [3]int{0, t, 0}, [3]int{1, t, min(t, 300)})
	}
	big = append(big, [3]int{1, 20000, 0})
	cases = append(cases, big)
	failed := false
	for n, ops := range cases {
		counter := Constructor()
		for step, op := range ops {
			if op[0] == 0 {
				counter.Hit(op[1])
			} else if got := counter.GetHits(op[1]); got != op[2] {
				fmt.Printf("case %d step %d GetHits(%d): expected %d, got %d\n", n, step, op[1], op[2], got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
