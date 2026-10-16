package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	big, bigExpected := make([]int, 1000), make([]int, 1000)
	for i := 0; i < 999; i++ {
		big[i], bigExpected[i] = 50, 999-i
	}
	big[999] = 60
	cases := []struct{ temps, expected []int }{{[]int{70, 68, 69, 72, 71}, []int{3, 1, 1, 0, 0}}, {[]int{50, 50, 50}, []int{0, 0, 0}},
		{[]int{30, 40, 50}, []int{1, 1, 0}}, {[]int{80, 60, 70, 90}, []int{3, 1, 1, 0}}, {[]int{55}, []int{0}},
		{[]int{100, 90, 80, 95, 30}, []int{0, 2, 1, 0, 0}}, {big, bigExpected}}
	failed := false
	for _, c := range cases {
		if got := dailyTemperatures(append([]int(nil), c.temps...)); !reflect.DeepEqual(got, c.expected) {
			fmt.Println("n =", len(c.temps), "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
