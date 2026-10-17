package main

import (
	"fmt"
	"os"
	"strings"
)

func main() {
	cases := []struct{ num1, num2, expected string }{
		{"12", "34", "408"},
		{"3", "4", "12"},
		{"999", "999", "998001"},
		{"0", "98765", "0"},
		{"2", "0", "0"},
		{"1", "1", "1"},
		{"25", "4", "100"},
		{"123456789", "987654321", "121932631112635269"},
		{"1" + strings.Repeat("0", 199), "1" + strings.Repeat("0", 199), "1" + strings.Repeat("0", 398)},
		// (10^200 - 1)^2 = 10^400 - 2 * 10^200 + 1
		{strings.Repeat("9", 200), strings.Repeat("9", 200), strings.Repeat("9", 199) + "8" + strings.Repeat("0", 199) + "1"},
	}
	failed := false
	for n, c := range cases {
		if got := multiply(c.num1, c.num2); got != c.expected {
			fmt.Println("case", n, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
