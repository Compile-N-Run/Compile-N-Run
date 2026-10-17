// LeetCode's NestedInteger for this problem: either one integer or a list of NestedIntegers.
function NestedInteger(value) {
  this._value = value === undefined ? null : value;
  this._list = value === undefined ? [] : null; // no value means an empty list
}
NestedInteger.prototype.isInteger = function () { return this._list === null; };
NestedInteger.prototype.getInteger = function () { return this._value; };
NestedInteger.prototype.setInteger = function (value) { this._value = value; this._list = null; };
NestedInteger.prototype.add = function (elem) { this._list.push(elem); };
NestedInteger.prototype.getList = function () { return this._list; };
