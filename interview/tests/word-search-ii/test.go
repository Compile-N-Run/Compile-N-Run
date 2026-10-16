package main

import (
	"fmt"
	"os"
	"reflect"
	"sort"
	"strings"
)

type wsCase struct {
	rows, words, expected []string
}

func main() {
	cases := []wsCase{
		{[]string{"cat", "ore", "dog"}, []string{"care", "tar", "code", "god", "cac"}, []string{"care", "god", "tar"}},
		{[]string{"ab", "dc"}, []string{"ab", "abc", "abcd", "abcda"}, []string{"ab", "abc", "abcd"}},
		{[]string{"a"}, []string{"a", "b", "aa"}, []string{"a"}},
		{[]string{"xyz", "qrs"}, []string{"hello"}, []string{}},
		{[]string{"aa", "aa"}, []string{"aaa", "aaaa", "aaaaa"}, []string{"aaa", "aaaa"}},
		{[]string{"tape", "oarn", "pike", "seal"}, []string{"tap", "pan", "pear", "rope", "kin", "ikea", "seal", "lake", "ran", "topi", "tapenade"},
			[]string{"lake", "seal", "tap", "topi"}},
		{[]string{"cat", "ore", "dog"}, []string{"care", "doge", "code", "cac", "tar", "caterodog", "dog", "god", "rod", "ore"},
			[]string{"care", "caterodog", "dog", "doge", "god", "ore", "rod", "tar"}},
		{[]string{"abc", "def", "ghi"}, []string{"abcfedghi", "abcfi", "adgheb", "ihgfedcba", "bei", "aei"}, []string{"abcfedghi", "abcfi", "adgheb"}},
	}
	var aWords, aWant []string
	for k := 1; k <= 10; k++ {
		aWords = append(aWords, strings.Repeat("a", k))
		aWant = append(aWant, strings.Repeat("a", k))
	}
	for k := 0; k < 10; k++ {
		aWords = append(aWords, strings.Repeat("a", k)+"b")
	}
	allA := make([]string, 6)
	for i := range allA {
		allA[i] = "aaaaaa"
	}
	cases = append(cases, wsCase{allA, aWords, aWant})
	// 12x12 grid; the words walked along rows and columns exist, 2000 pseudo-random words do not.
	grid := make([]string, 12)
	for r := 0; r < 12; r++ {
		row := make([]byte, 12)
		for c := 0; c < 12; c++ {
			row[c] = byte('a' + (r*7+c*3)%26)
		}
		grid[r] = string(row)
	}
	var walks []string
	for r := 0; r < 12; r++ {
		for c := 0; c < 3; c++ {
			walks = append(walks, grid[r][c:c+10])
		}
	}
	for c := 0; c < 12; c++ {
		for r := 0; r < 3; r++ {
			w := make([]byte, 10)
			for i := 0; i < 10; i++ {
				w[i] = grid[r+i][c]
			}
			walks = append(walks, string(w))
		}
	}
	seed := int64(12345)
	rand := func() int64 { seed = seed * 48271 % 2147483647; return seed }
	bigWords := append([]string{}, walks...)
	for n := 0; n < 2000; n++ {
		length := 6 + int(rand()%5)
		w := make([]byte, length)
		for i := range w {
			w[i] = byte('a' + rand()%26)
		}
		bigWords = append(bigWords, string(w))
	}
	seen := map[string]bool{}
	var distinctWords []string
	for _, w := range bigWords {
		if !seen[w] {
			seen[w] = true
			distinctWords = append(distinctWords, w)
		}
	}
	walkSet := map[string]bool{}
	var walkWant []string
	for _, w := range walks {
		if !walkSet[w] {
			walkSet[w] = true
			walkWant = append(walkWant, w)
		}
	}
	sort.Strings(walkWant)
	cases = append(cases, wsCase{grid, distinctWords, walkWant})
	failed := false
	for n, c := range cases {
		board := make([][]byte, len(c.rows))
		for i, row := range c.rows {
			board[i] = []byte(row)
		}
		got := findWords(board, append([]string{}, c.words...))
		sort.Strings(got)
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
