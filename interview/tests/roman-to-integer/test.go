package main

import (
	"fmt"
	"os"
	"strings"
)

func toRoman(n int) string {
	values := []int{1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1}
	symbols := []string{"M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"}
	var out strings.Builder
	for i, v := range values {
		for n >= v {
			out.WriteString(symbols[i])
			n -= v
		}
	}
	return out.String()
}

func main() {
	cases := []struct {
		s        string
		expected int
	}{{"LXXVIII", 78}, {"CDXLIV", 444}, {"MMXXVI", 2026}, {"IX", 9}, {"I", 1}, {"MMMCMXCIX", 3999},
		{"MMMDCCCLXXXVIII", 3888}, {"XLIX", 49}}
	for n := 1; n < 4000; n++ { // every valid numeral
		cases = append(cases, struct {
			s        string
			expected int
		}{toRoman(n), n})
	}
	failed := false
	for _, c := range cases {
		if got := romanToInt(c.s); got != c.expected {
			fmt.Println(c.s, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
