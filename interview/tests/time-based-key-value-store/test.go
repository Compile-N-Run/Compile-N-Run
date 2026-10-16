package main

import (
	"fmt"
	"os"
)

type tmOp struct {
	isSet     bool
	key, text string // value for set, expected result for get
	timestamp int
}

func tmSet(k, v string, t int) tmOp           { return tmOp{true, k, v, t} }
func tmGet(k string, t int, want string) tmOp { return tmOp{false, k, want, t} }

func main() {
	cases := [][]tmOp{
		{tmSet("color", "red", 3), tmSet("color", "blue", 8), tmGet("color", 2, ""), tmGet("color", 3, "red"),
			tmGet("color", 5, "red"), tmGet("color", 8, "blue"), tmGet("color", 100, "blue"), tmGet("size", 5, "")},
		{tmGet("x", 1, "")},
		{tmSet("a", "one", 1), tmGet("a", 1, "one"), tmGet("a", 10000000, "one")},
		{tmSet("a", "p", 2), tmSet("b", "q", 4), tmSet("a", "r", 6), tmGet("b", 3, ""), tmGet("a", 4, "p"),
			tmGet("b", 5, "q"), tmGet("a", 6, "r"), tmGet("c", 6, "")},
		{tmSet("k", "same", 1), tmSet("k", "same", 2), tmSet("k", "diff", 3), tmGet("k", 2, "same"), tmGet("k", 3, "diff")},
		{tmSet("love", "high", 10), tmSet("love", "low", 20), tmGet("love", 5, ""), tmGet("love", 10, "high"),
			tmGet("love", 15, "high"), tmGet("love", 20, "low"), tmGet("love", 25, "low")},
	}
	big := []tmOp{}
	for i := 1; i <= 1000; i++ {
		big = append(big, tmSet("k", fmt.Sprintf("v%d", i), 2*i))
	}
	for i := 1; i <= 1000; i++ {
		big = append(big, tmGet("k", 2*i+1, fmt.Sprintf("v%d", i)))
	}
	big = append(big, tmGet("k", 1, ""))
	cases = append(cases, big)
	failed := false
	for n, ops := range cases {
		tm := Constructor()
		for step, op := range ops {
			if op.isSet {
				tm.Set(op.key, op.text, op.timestamp)
			} else if got := tm.Get(op.key, op.timestamp); got != op.text {
				fmt.Printf("case %d step %d Get(%q, %d): expected %q, got %q\n", n, step, op.key, op.timestamp, op.text, got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
