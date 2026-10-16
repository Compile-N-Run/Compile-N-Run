package main

import (
	"fmt"
	"math"
	"os"
	"sort"
)

// op is one call: add == true adds value, otherwise value is the expected median.
type op struct {
	add   bool
	value float64
}

func main() {
	a := func(n int) op { return op{true, float64(n)} }
	m := func(v float64) op { return op{false, v} }
	sequences := [][]op{
		{a(4), m(4), a(10), m(7), a(1), m(4), a(7), m(5.5)},
		{a(-5), m(-5)},
		{a(3), a(3), a(3), m(3), a(3), m(3)},
		{a(5), m(5), a(4), m(4.5), a(3), m(4), a(2), m(3.5), a(1), m(3)},
		{a(-100000), a(100000), m(0), a(0), m(0)},
		{a(2), m(2), m(2), a(8), m(5), m(5)},
	}
	big, ref := []op{}, []int{}
	x := int64(11)
	for i := 0; i < 3000; i++ {
		x = x * 48271 % 2147483647
		num := int(x%200001) - 100000
		pos := sort.SearchInts(ref, num)
		ref = append(ref, 0)
		copy(ref[pos+1:], ref[pos:])
		ref[pos] = num
		t := len(ref)
		med := float64(ref[t/2])
		if t%2 == 0 {
			med = float64(ref[t/2-1]+ref[t/2]) / 2
		}
		big = append(big, a(num), m(med))
	}
	sequences = append(sequences, big)
	failed := false
	for s, ops := range sequences {
		finder := Constructor()
		for step, o := range ops {
			if o.add {
				finder.AddNum(int(o.value))
			} else if got := finder.FindMedian(); math.Abs(got-o.value) > 1e-6 {
				fmt.Println("sequence", s, "step", step, "expected", o.value, "got", got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
