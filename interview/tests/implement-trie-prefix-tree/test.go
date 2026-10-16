package main

import (
	"fmt"
	"os"
	"strconv"
)

type trieOp struct {
	op       int // 0 insert, 1 search, 2 startsWith
	s        string
	expected int
}

func trieWord(i int) string { // digits of i spelled as letters: 123 -> "wbcd"
	s := "w"
	for _, d := range strconv.Itoa(i) {
		s += string(rune('a' + (d - '0')))
	}
	return s
}

func main() {
	cases := [][]trieOp{
		{{0, "card", 0}, {1, "card", 1}, {1, "car", 0}, {2, "car", 1}, {0, "car", 0}, {1, "car", 1}, {2, "cat", 0}, {2, "c", 1}, {1, "cards", 0}},
		{{1, "a", 0}, {2, "a", 0}},
		{{0, "a", 0}, {1, "a", 1}, {2, "a", 1}, {1, "aa", 0}, {2, "aa", 0}, {1, "b", 0}, {2, "b", 0}},
		{{0, "zoo", 0}, {0, "zoo", 0}, {1, "zoo", 1}, {1, "zo", 0}, {2, "zoo", 1}, {2, "zoom", 0}},
		{{0, "apple", 0}, {0, "apply", 0}, {0, "ape", 0}, {1, "app", 0}, {2, "app", 1}, {2, "appl", 1}, {1, "apply", 1}, {1, "ape", 1},
			{1, "apes", 0}, {2, "apes", 0}, {2, "b", 0}, {0, "app", 0}, {1, "app", 1}},
		{{0, "abcdefghijklmnopqrstuvwxyz", 0}, {1, "abcdefghijklmnopqrstuvwxyz", 1}, {1, "abcdefghijklmnopqrstuvwxy", 0},
			{2, "abcdefghijklmnopqrstuvwxy", 1}, {0, "z", 0}, {1, "z", 1}, {1, "zz", 0}, {2, "zy", 0}},
	}
	big := []trieOp{}
	for i := 0; i < 2000; i += 2 {
		big = append(big, trieOp{0, trieWord(i), 0})
	}
	for i := 0; i < 2000; i++ {
		big = append(big, trieOp{1, trieWord(i), 1 - i%2})
	}
	for i := 0; i < 200; i++ {
		big = append(big, trieOp{2, trieWord(i), 1})
	}
	for i := 0; i < 200; i++ {
		big = append(big, trieOp{2, trieWord(i) + "z", 0})
	}
	cases = append(cases, big)
	failed := false
	for n, ops := range cases {
		trie := Constructor()
		for step, o := range ops {
			if o.op == 0 {
				trie.Insert(o.s)
				continue
			}
			var got bool
			if o.op == 1 {
				got = trie.Search(o.s)
			} else {
				got = trie.StartsWith(o.s)
			}
			if got != (o.expected == 1) {
				fmt.Printf("case %d step %d op %d(%q): expected %v, got %v\n", n, step, o.op, o.s, o.expected == 1, got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
