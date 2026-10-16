package main

import (
	"fmt"
	"os"
)

func main() {
	var big []string
	for a := 'a'; a <= 'j'; a++ {
		for b := 'a'; b <= 'j'; b++ {
			for c := 'a'; c <= 'j'; c++ {
				big = append(big, string([]rune{a, b, c}))
			}
		}
	}
	cases := []struct {
		begin, end string
		words      []string
		expected   int
	}{
		{"cat", "dog", []string{"cot", "cog", "dog", "bat"}, 4},
		{"cold", "warm", []string{"cord", "card", "ward", "warm", "worm"}, 5},
		{"cat", "dog", []string{"cot", "cog", "bat"}, 0},
		{"a", "c", []string{"a", "b", "c"}, 2},
		{"hot", "dog", []string{"hot", "dog"}, 0},
		{"lost", "cost", []string{"most", "fist", "lost", "cost", "fish"}, 2},
		{"abc", "xyz", []string{"abd", "xyz"}, 0},
		{"aaa", "jjj", big, 4},
	}
	failed := false
	for _, c := range cases {
		got := ladderLength(c.begin, c.end, append([]string(nil), c.words...))
		if got != c.expected {
			fmt.Println(c.begin, "->", c.end, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
