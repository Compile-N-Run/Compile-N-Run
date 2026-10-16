package main

import (
	"fmt"
	"os"
)

type bankCase struct {
	balance []int64
	ops     [][5]int64 // {0, account, 0, money, expected} deposit, {1, ...} withdraw, {2, account1, account2, money, expected} transfer
}

func main() {
	cases := []bankCase{
		{[]int64{10, 100, 20, 50, 30}, [][5]int64{{1, 3, 0, 10, 1}, {2, 5, 1, 20, 1}, {0, 5, 0, 20, 1}, {2, 3, 4, 15, 0}, {1, 10, 0, 50, 0},
			{1, 1, 0, 30, 1}, {1, 5, 0, 30, 1}, {1, 2, 0, 101, 0}}},
		{[]int64{0}, [][5]int64{{0, 1, 0, 5, 1}, {1, 1, 0, 5, 1}, {1, 1, 0, 1, 0}, {2, 1, 2, 1, 0}, {0, 0, 0, 5, 0}, {0, 2, 0, 5, 0}, {1, 1, 0, 1, 0}}},
		{[]int64{7}, [][5]int64{{1, 1, 0, 8, 0}, {1, 1, 0, 7, 1}, {1, 1, 0, 7, 0}}},
		{[]int64{5, 0}, [][5]int64{{2, 2, 1, 1, 0}, {2, 1, 2, 5, 1}, {2, 1, 2, 1, 0}, {1, 2, 0, 5, 1}, {1, 1, 0, 1, 0}}},
		{[]int64{5000000000000, 1}, [][5]int64{{1, 1, 0, 4000000000000, 1}, {2, 1, 2, 1000000000000, 1}, {1, 1, 0, 1, 0},
			{1, 2, 0, 1000000000001, 1}, {1, 2, 0, 1, 0}, {0, 2, 0, 9999999999999, 1}, {1, 2, 0, 9999999999999, 1}}},
		{[]int64{10, 10}, [][5]int64{{2, 1, 2, 11, 0}, {2, 1, 3, 5, 0}, {2, 0, 2, 5, 0}, {1, 1, 0, 10, 1}, {1, 2, 0, 10, 1}, {2, 1, 2, 1, 0}}},
	}
	big := [][5]int64{}
	for i := int64(1); i <= 1000; i++ {
		big = append(big, [5]int64{0, i, 0, i, 1})
	}
	for i := int64(1); i < 1000; i++ {
		big = append(big, [5]int64{2, i, i + 1, 1000 + i, 1})
	}
	for i := int64(2); i < 1000; i++ {
		big = append(big, [5]int64{1, i, 0, 999 + i, 1})
	}
	for i := int64(1); i < 1000; i++ {
		big = append(big, [5]int64{1, i, 0, 1, 0})
	}
	big = append(big, [5]int64{1, 1000, 0, 3999, 1}, [5]int64{1, 1000, 0, 1, 0})
	balance := make([]int64, 1000)
	for i := range balance {
		balance[i] = 1000
	}
	cases = append(cases, bankCase{balance, big})
	failed := false
	for n, c := range cases {
		bank := Constructor(append([]int64(nil), c.balance...))
		for step, op := range c.ops {
			var got bool
			switch op[0] {
			case 0:
				got = bank.Deposit(int(op[1]), op[3])
			case 1:
				got = bank.Withdraw(int(op[1]), op[3])
			default:
				got = bank.Transfer(int(op[1]), int(op[2]), op[3])
			}
			if got != (op[4] == 1) {
				fmt.Printf("case %d step %d op %d(%d, %d, %d): expected %v, got %v\n", n, step, op[0], op[1], op[2], op[3], op[4] == 1, got)
				failed = true
			}
		}
	}
	if failed {
		os.Exit(1)
	}
}
