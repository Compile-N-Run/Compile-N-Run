package main

import (
	"fmt"
	"os"
)

type queueCase struct {
	k   int
	ops [][3]int // {0, value, expected} enQueue, {1, 0, expected} deQueue, {2, 0, expected} Front,
	// {3, 0, expected} Rear, {4, 0, expected} isEmpty, {5, 0, expected} isFull; booleans are 1/0
}

func main() {
	big := [][3]int{}
	for v := 0; v < 1000; v++ {
		big = append(big, [3]int{0, v, 1})
	}
	big = append(big, [3]int{0, 1000, 0}, [3]int{5, 0, 1})
	for i := 0; i < 500; i++ {
		big = append(big, [3]int{1, 0, 1})
	}
	big = append(big, [3]int{2, 0, 500}, [3]int{3, 0, 999})
	for v := 1000; v < 1500; v++ {
		big = append(big, [3]int{0, v, 1})
	}
	big = append(big, [3]int{3, 0, 1499}, [3]int{5, 0, 1}, [3]int{0, 9, 0})
	for i := 0; i < 1000; i++ {
		big = append(big, [3]int{1, 0, 1})
	}
	big = append(big, [3]int{1, 0, 0}, [3]int{4, 0, 1}, [3]int{2, 0, -1}, [3]int{3, 0, -1})
	cases := []queueCase{
		{3, [][3]int{{0, 4, 1}, {0, 9, 1}, {0, 2, 1}, {0, 7, 0}, {5, 0, 1}, {1, 0, 1}, {2, 0, 9}, {0, 7, 1}, {3, 0, 7}, {4, 0, 0}}},
		{1, [][3]int{{2, 0, -1}, {3, 0, -1}, {1, 0, 0}, {4, 0, 1}, {0, 5, 1}, {5, 0, 1}, {0, 6, 0}, {2, 0, 5}, {3, 0, 5}, {1, 0, 1}, {4, 0, 1},
			{2, 0, -1}, {0, 8, 1}, {3, 0, 8}}},
		{2, [][3]int{{0, 1, 1}, {0, 2, 1}, {1, 0, 1}, {0, 3, 1}, {2, 0, 2}, {3, 0, 3}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 0}, {4, 0, 1},
			{0, 7, 1}, {2, 0, 7}, {3, 0, 7}}},
		{4, [][3]int{{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {0, 4, 1}, {5, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1}, {1, 0, 1}, {4, 0, 1}, {0, 5, 1},
			{0, 6, 1}, {2, 0, 5}, {3, 0, 6}, {1, 0, 1}, {2, 0, 6}, {3, 0, 6}}},
		{3, [][3]int{{0, 0, 1}, {0, 0, 1}, {2, 0, 0}, {3, 0, 0}, {1, 0, 1}, {3, 0, 0}, {2, 0, 0}, {0, 1000, 1}, {3, 0, 1000}, {5, 0, 0}, {0, 2, 1}, {5, 0, 1}}},
		{3, [][3]int{{0, 1, 1}, {0, 2, 1}, {0, 3, 1}, {1, 0, 1}, {0, 4, 1}, {2, 0, 2}, {3, 0, 4}, {1, 0, 1}, {0, 5, 1}, {2, 0, 3}, {3, 0, 5},
			{1, 0, 1}, {0, 6, 1}, {2, 0, 4}, {3, 0, 6}, {1, 0, 1}, {0, 7, 1}, {2, 0, 5}, {3, 0, 7}}},
		{1000, big},
	}
	failed := false
	for n, c := range cases {
		queue := Constructor(c.k)
		for step, op := range c.ops {
			var got int
			switch op[0] {
			case 0:
				got = boolToInt(queue.EnQueue(op[1]))
			case 1:
				got = boolToInt(queue.DeQueue())
			case 2:
				got = queue.Front()
			case 3:
				got = queue.Rear()
			case 4:
				got = boolToInt(queue.IsEmpty())
			default:
				got = boolToInt(queue.IsFull())
			}
			if got != op[2] {
				fmt.Printf("case %d step %d op %d: expected %d, got %d\n", n, step, op[0], op[2], got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}
