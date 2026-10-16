package main

import (
	"fmt"
	"os"
	"reflect"
)

func main() {
	nines, bigSum := make([]int, 100), make([]int, 101)
	for i := range nines {
		nines[i] = 9
	}
	bigSum[100] = 1
	seq, seqDouble := []int{}, []int{} // 1234567890 repeated 10 times, ones digit first, and its double
	for i := 0; i < 10; i++ {
		seq = append(seq, 0, 9, 8, 7, 6, 5, 4, 3, 2, 1)
	}
	carryIn := 0
	for _, d := range seq {
		s := 2*d + carryIn
		seqDouble = append(seqDouble, s%10)
		carryIn = s / 10
	}
	if carryIn > 0 {
		seqDouble = append(seqDouble, carryIn)
	}
	cases := []struct{ a, b, expected []int }{{[]int{2, 1, 5}, []int{8, 4}, []int{0, 6, 5}}, {[]int{9, 9}, []int{1}, []int{0, 0, 1}},
		{[]int{0}, []int{0}, []int{0}}, {[]int{3}, []int{4}, []int{7}}, {[]int{1}, []int{9, 9, 9, 9}, []int{0, 0, 0, 0, 1}},
		{[]int{5}, []int{5}, []int{0, 1}}, {[]int{1, 0, 1}, []int{2, 3}, []int{3, 3, 1}},
		{nines, []int{1}, bigSum}, {seq, seq, seqDouble}}
	failed := false
	for _, c := range cases {
		got := listValues(addTwoNumbers(buildList(c.a), buildList(c.b)))
		if !reflect.DeepEqual(got, c.expected) {
			fmt.Println(c.a, "+", c.b, "expected", c.expected, "got", got)
			failed = true
		}
	}
	if failed {
		os.Exit(1)
	}
}
