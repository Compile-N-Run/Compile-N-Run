package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct {
		tokens   []string
		expected int
	}{
		{[]string{"3", "4", "+", "2", "*"}, 14},
		{[]string{"10", "3", "/"}, 3},
		{[]string{"-7", "2", "/"}, -3},
		{[]string{"7", "-2", "/"}, -3},
		{[]string{"-7", "-2", "/"}, 3},
		{[]string{"0", "-5", "/"}, 0},
		{[]string{"2", "3", "4", "*", "+", "5", "-"}, 9},
		{[]string{"5"}, 5},
		{[]string{"-3", "-2", "*"}, 6},
		{[]string{"6", "3", "-"}, 3},
		{[]string{"2147483647", "1", "-"}, 2147483646},
		{[]string{"-2147483648", "1", "/"}, -2147483648},
		{[]string{"4", "13", "5", "/", "+"}, 6},
	}
	var ones []string // pushes everything before the first operator
	for i := 0; i < 1000; i++ {
		ones = append(ones, "1")
	}
	for i := 0; i < 999; i++ {
		ones = append(ones, "+")
	}
	doubling := []string{"3", "1", "*"} // x -> 2x - 1, ten times, from 3
	for i := 0; i < 10; i++ {
		doubling = append(doubling, "2", "*", "1", "-")
	}
	cases = append(cases, struct {
		tokens   []string
		expected int
	}{ones, 1000}, struct {
		tokens   []string
		expected int
	}{doubling, 2049})
	failed := false
	for n, c := range cases {
		if got := evalRPN(append([]string(nil), c.tokens...)); got != c.expected {
			label := strings.Join(c.tokens, " ")
			if len(c.tokens) > 12 {
				label = fmt.Sprintf("%s ... (%d tokens)", strings.Join(c.tokens[:6], " "), len(c.tokens))
			}
			fmt.Printf("case %d %s: expected %d, got %d\n", n, label, c.expected, got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
