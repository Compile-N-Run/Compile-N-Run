# LeetCode's NestedInteger for this problem: either one integer or a list of NestedIntegers.
class NestedInteger:
    def __init__(self, value=None):
        """With no value, an empty list; with an integer, that integer."""
        self._value = value
        self._list = [] if value is None else None

    def isInteger(self) -> bool:
        return self._list is None

    def add(self, elem: 'NestedInteger') -> None:
        self._list.append(elem)

    def setInteger(self, value: int) -> None:
        self._value, self._list = value, None

    def getInteger(self) -> int:
        return self._value

    def getList(self) -> ['NestedInteger']:
        return self._list
