package main

import (
	"fmt"
	"os"
)

type lfuCase struct {
	capacity int
	ops      [][3]int // {0, key, value} for put or {1, key, expected} for get
}

func main() {
	cases := []lfuCase{
		{2, [][3]int{{0, 1, 10}, {0, 2, 20}, {1, 1, 10}, {0, 3, 30}, {1, 2, -1}, {1, 3, 30}, {0, 4, 40}, {1, 1, -1}, {1, 3, 30}, {1, 4, 40}}},
		{1, [][3]int{{0, 5, 50}, {1, 5, 50}, {0, 6, 60}, {1, 5, -1}, {1, 6, 60}}},
		{2, [][3]int{{0, 1, 1}, {0, 2, 2}, {0, 1, 100}, {0, 3, 3}, {1, 1, 100}, {1, 2, -1}, {1, 3, 3}}},
		{3, [][3]int{{1, 7, -1}, {0, 7, 0}, {1, 7, 0}, {1, 8, -1}}},
		{2, [][3]int{{0, 1, 1}, {1, 1, 1}, {1, 1, 1}, {1, 1, 1}, {0, 2, 2}, {0, 3, 3}, {1, 2, -1}, {1, 3, 3}, {0, 4, 4}, {1, 3, -1}, {1, 1, 1}, {1, 4, 4}}},
		{3, [][3]int{{0, 1, 1}, {0, 2, 2}, {0, 3, 3}, {0, 4, 4}, {1, 1, -1}, {1, 2, 2}, {0, 5, 5}, {1, 3, -1}, {1, 4, 4}, {1, 5, 5}}},
		{2, [][3]int{{0, 3, 1}, {0, 2, 1}, {0, 2, 2}, {0, 4, 4}, {1, 2, 2}, {1, 3, -1}, {1, 4, 4}}},
	}
	// Keys 0..49 are read once, so they outlive every key that is only ever inserted.
	big := [][3]int{}
	for i := 0; i < 100; i++ {
		big = append(big, [3]int{0, i, 2 * i})
	}
	for i := 0; i < 50; i++ {
		big = append(big, [3]int{1, i, 2 * i})
	}
	for i := 100; i < 1000; i++ {
		big = append(big, [3]int{0, i, 2 * i})
	}
	for i := 0; i < 1000; i++ {
		want := -1
		if i < 50 || i >= 950 {
			want = 2 * i
		}
		big = append(big, [3]int{1, i, want})
	}
	cases = append(cases, lfuCase{100, big})
	failed := false
	for n, c := range cases {
		cache := Constructor(c.capacity)
		for step, op := range c.ops {
			if op[0] == 0 {
				cache.Put(op[1], op[2])
			} else if got := cache.Get(op[1]); got != op[2] {
				fmt.Printf("case %d step %d get(%d): expected %d, got %d\n", n, step, op[1], op[2], got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
