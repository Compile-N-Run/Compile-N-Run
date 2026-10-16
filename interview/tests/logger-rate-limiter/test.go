package main

import (
	"fmt"
	"os"
)

type logCall struct {
	t        int
	msg      string
	expected bool
}

func main() {
	// Each case is a list of calls on one Logger.
	cases := [][]logCall{
		{{1, "start", true}, {4, "stop", true}, {10, "start", false}, {11, "start", true}, {13, "stop", false}, {14, "stop", true}},
		{{0, "a", true}, {5, "a", false}, {9, "a", false}, {10, "a", true}, {19, "a", false}, {20, "a", true}},
		{{7, "x", true}, {7, "y", true}, {7, "x", false}, {7, "z", true}, {16, "y", false}, {17, "y", true}},
		{{1000000000, "only", true}},
		{{1, "foo", true}, {100, "foo", true}, {105, "bar", true}, {109, "foo", false}, {110, "foo", true}},
		{{3, "Hi", true}, {4, "hi", true}, {5, "Hi", false}, {13, "Hi", true}, {13, "hi", false}, {14, "hi", true}},
	}
	big := []logCall{}
	for t := 0; t < 10000; t++ {
		big = append(big, logCall{t, fmt.Sprintf("m%d", t%50), true}) // each of these repeats every 50 seconds
		big = append(big, logCall{t, "same", t%10 == 0})
	}
	cases = append(cases, big)
	failed := false
	for n, calls := range cases {
		logger := Constructor()
		for step, c := range calls {
			if got := logger.ShouldPrintMessage(c.t, c.msg); got != c.expected {
				fmt.Printf("case %d step %d (%d, %q): expected %v, got %v\n", n, step, c.t, c.msg, c.expected, got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
