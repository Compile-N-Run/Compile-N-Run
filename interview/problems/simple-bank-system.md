---
title: Simple Bank System
leetcode: simple-bank-system
description: "Simple Bank System explained: design a Bank class whose deposit, withdraw and transfer validate the account numbers and balances before changing anything, backed by one array of 64-bit balances, with solutions in Python, Java, C++, JavaScript and Go."
---

## Problem

Design a class `Bank` that manages `n` accounts numbered from `1` to `n`. The constructor receives an array `balance` where `balance[i]` is the starting money in account `i + 1`. Balances can be large (up to about 10¹²), so they need a 64-bit integer type. Three operations must be supported, each returning `true` if it was carried out and `false` if it was rejected:

- **deposit(account, money):** add `money` to the account. Rejected only when the account number is invalid.
- **withdraw(account, money):** remove `money` from the account. Rejected when the account number is invalid or the account holds less than `money`.
- **transfer(account1, account2, money):** move `money` from `account1` to `account2`. Rejected when either account number is invalid or `account1` holds less than `money`.

A rejected operation changes nothing. `money` is always positive. In Go the constructor is a function named `Constructor` and the methods are `Deposit`, `Withdraw` and `Transfer`.

## Examples

Starting balances `[10, 100, 20, 50, 30]` (accounts 1 to 5):

- `withdraw(3, 10)` → `true`; account 3 goes from 20 to 10.
- `transfer(5, 1, 20)` → `true`; account 5 drops to 10 and account 1 rises to 30.
- `deposit(5, 20)` → `true`; account 5 is back to 30.
- `transfer(3, 4, 15)` → `false`; account 3 only has 10, so nothing moves.
- `withdraw(10, 50)` → `false`; there is no account 10.

Starting balances `[5, 0]`: `transfer(2, 1, 1)` → `false` (account 2 is empty), `transfer(1, 2, 5)` → `true`, then `withdraw(2, 5)` → `true` and `withdraw(1, 1)` → `false`.

## Key idea

There is no clever data structure here: the array of balances already *is* the bank, because account numbers map straight to indices (`account - 1`). The whole problem is about **validation order**: check every precondition first, change the balances only once all checks pass, and never leave a transfer half done. The one trap is the 1-based account numbering and the 64-bit balances.

## Approach

1. Store the `balance` array as it is (copying it is optional; LeetCode only reads it through your class).
2. Write a helper `valid(account)` that returns whether `1 <= account <= n`.
3. **deposit:** if the account is invalid return `false`; otherwise add `money` and return `true`.
4. **withdraw:** if the account is invalid or `balance[account - 1] < money` return `false`; otherwise subtract and return `true`.
5. **transfer:** if either account is invalid or `balance[account1 - 1] < money` return `false`; otherwise subtract from the first, add to the second, return `true`. Check the destination account *before* touching the source account.

`transfer` can be written as "withdraw from account1, then deposit to account2", but only if you check `valid(account2)` before calling withdraw; otherwise a transfer to a non-existent account would silently take the money out and return `false`.

## Complexity

- **Time:** O(1) per operation; each does a couple of comparisons and array updates.
- **Space:** O(n) for the balances, which the input already provides.

## Common mistakes

- Indexing the array with `account` instead of `account - 1`, so account 1 reads the wrong slot and account `n` crashes.
- Implementing `transfer` as `withdraw` followed by `deposit` and validating the destination too late: the money disappears when the second account does not exist.
- Checking `balance < money` before checking that the account exists, which indexes out of bounds for an invalid account number.
- Using 32-bit integers in Java, C++ or Go: balances reach 10¹² and overflow `int`.

## Follow-up questions

- How would you make the bank safe for concurrent requests? (Lock per account, always acquiring the lower-numbered account first in a transfer to avoid deadlocks, or use an atomic compare-and-swap loop.)
- How would you support creating and closing accounts? (A hash map from account id to balance replaces the array; validation becomes a map lookup.)
- How would you add a transaction log so operations can be audited or rolled back?

## Related problems

- [Design Hit Counter](/interview/problems/design-hit-counter/)
- [Time Based Key-Value Store](/interview/problems/time-based-key-value-store/)
- Design Parking System

## Solutions

```python
class Bank:
    def __init__(self, balance: List[int]):
        self.balance = balance

    def _valid(self, account: int) -> bool:
        return 1 <= account <= len(self.balance)

    def transfer(self, account1: int, account2: int, money: int) -> bool:
        if not self._valid(account1) or not self._valid(account2) or self.balance[account1 - 1] < money:
            return False
        self.balance[account1 - 1] -= money
        self.balance[account2 - 1] += money
        return True

    def deposit(self, account: int, money: int) -> bool:
        if not self._valid(account):
            return False
        self.balance[account - 1] += money
        return True

    def withdraw(self, account: int, money: int) -> bool:
        if not self._valid(account) or self.balance[account - 1] < money:
            return False
        self.balance[account - 1] -= money
        return True
```

```java
class Bank {
    private final long[] balance;

    public Bank(long[] balance) {
        this.balance = balance;
    }

    private boolean valid(int account) {
        return account >= 1 && account <= balance.length;
    }

    public boolean transfer(int account1, int account2, long money) {
        if (!valid(account1) || !valid(account2) || balance[account1 - 1] < money) {
            return false;
        }
        balance[account1 - 1] -= money;
        balance[account2 - 1] += money;
        return true;
    }

    public boolean deposit(int account, long money) {
        if (!valid(account)) {
            return false;
        }
        balance[account - 1] += money;
        return true;
    }

    public boolean withdraw(int account, long money) {
        if (!valid(account) || balance[account - 1] < money) {
            return false;
        }
        balance[account - 1] -= money;
        return true;
    }
}
```

```cpp
class Bank {
    vector<long long> balance;

    bool valid(int account) const {
        return account >= 1 && account <= (int)balance.size();
    }

public:
    Bank(vector<long long>& balance) : balance(balance) {}

    bool transfer(int account1, int account2, long long money) {
        if (!valid(account1) || !valid(account2) || balance[account1 - 1] < money) {
            return false;
        }
        balance[account1 - 1] -= money;
        balance[account2 - 1] += money;
        return true;
    }

    bool deposit(int account, long long money) {
        if (!valid(account)) {
            return false;
        }
        balance[account - 1] += money;
        return true;
    }

    bool withdraw(int account, long long money) {
        if (!valid(account) || balance[account - 1] < money) {
            return false;
        }
        balance[account - 1] -= money;
        return true;
    }
};
```

```javascript
/**
 * @param {number[]} balance
 */
var Bank = function (balance) {
  this.balance = balance;
};

Bank.prototype.valid = function (account) {
  return account >= 1 && account <= this.balance.length;
};

/**
 * @param {number} account1
 * @param {number} account2
 * @param {number} money
 * @return {boolean}
 */
Bank.prototype.transfer = function (account1, account2, money) {
  if (!this.valid(account1) || !this.valid(account2) || this.balance[account1 - 1] < money) {
    return false;
  }
  this.balance[account1 - 1] -= money;
  this.balance[account2 - 1] += money;
  return true;
};

/**
 * @param {number} account
 * @param {number} money
 * @return {boolean}
 */
Bank.prototype.deposit = function (account, money) {
  if (!this.valid(account)) {
    return false;
  }
  this.balance[account - 1] += money;
  return true;
};

/**
 * @param {number} account
 * @param {number} money
 * @return {boolean}
 */
Bank.prototype.withdraw = function (account, money) {
  if (!this.valid(account) || this.balance[account - 1] < money) {
    return false;
  }
  this.balance[account - 1] -= money;
  return true;
};
```

```go
type Bank struct {
	balance []int64
}

func Constructor(balance []int64) Bank {
	return Bank{balance: balance}
}

func (this *Bank) valid(account int) bool {
	return account >= 1 && account <= len(this.balance)
}

func (this *Bank) Transfer(account1 int, account2 int, money int64) bool {
	if !this.valid(account1) || !this.valid(account2) || this.balance[account1-1] < money {
		return false
	}
	this.balance[account1-1] -= money
	this.balance[account2-1] += money
	return true
}

func (this *Bank) Deposit(account int, money int64) bool {
	if !this.valid(account) {
		return false
	}
	this.balance[account-1] += money
	return true
}

func (this *Bank) Withdraw(account int, money int64) bool {
	if !this.valid(account) || this.balance[account-1] < money {
		return false
	}
	this.balance[account-1] -= money
	return true
}
```
