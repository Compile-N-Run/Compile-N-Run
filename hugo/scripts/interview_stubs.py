#!/usr/bin/env python3
"""Starter code ("stubs") for the editor on /interview/problems/<slug>/.

A stub is the solution with the bodies removed: the class and the public method signatures LeetCode asks for,
in each language. It is derived from the write-up's solution so the two never drift, and only the names the
problem's tests call are kept (helpers such as a private Node class or an addFront method are dropped).

  python3 hugo/scripts/interview_stubs.py two-sum   # print the five stubs
"""
import ast
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TESTS = os.path.join(ROOT, 'interview', 'tests')
TODO = 'your code here'


def _read(path):
    return open(path, encoding='utf-8').read() if os.path.isfile(path) else ''


def _called(text):
    """Identifiers used as `name(` or `.name(` in a test file."""
    return set(re.findall(r'(?<![\w.])(\w+)\s*\(', text)) | set(re.findall(r'\.(\w+)\s*\(', text))


def python_stub(code, test):
    tree = ast.parse(code)
    lines = code.split('\n')
    used = _called(test) | {'Solution'}
    out = []
    for node in tree.body:
        if not isinstance(node, ast.ClassDef) or node.name not in used:
            continue
        out.append(f'class {node.name}:')
        members = []
        for item in node.body:
            if isinstance(item, ast.FunctionDef) and (item.name == '__init__' or not item.name.startswith('_')):
                head, depth = [], 0  # the signature may span lines; stop at the colon that closes it
                for text in lines[item.lineno - 1:]:
                    head.append(text.rstrip())
                    depth += text.count('(') - text.count(')')
                    if depth == 0 and text.rstrip().endswith(':'):
                        break
                head = '\n'.join(head)
                members.append(f'{head}\n        # {TODO}\n        pass')
        out.append('\n\n'.join(members) if members else '    pass')
        out.append('')
    return '\n'.join(out).rstrip() + '\n'


def javascript_stub(code, test):
    used = _called(test)
    out = []
    for line in code.split('\n'):
        m = re.match(r'^var (\w+) = function \(([^)]*)\) \{', line)
        if m and (m.group(1) in used or m.group(1) in test):
            out.append(f'{line}\n  // {TODO}\n}};\n')
            continue
        m = re.match(r'^(\w+)\.prototype\.(\w+) = function \(([^)]*)\) \{', line)
        if m and m.group(1) in test and m.group(2) in used:
            out.append(f'{line}\n  // {TODO}\n}};\n')
    return '\n'.join(out).rstrip() + '\n'


JAVA_DEFAULT = {'void': '', 'int': 'return 0;', 'long': 'return 0L;', 'double': 'return 0.0;', 'boolean': 'return false;',
                'char': "return ' ';", 'String': 'return "";'}


def java_stub(code, test):
    used = _called(test)
    out, depth, keep = [], 0, False
    for line in code.split('\n'):
        m = re.match(r'^(?:public |final )*class (\w+)', line)
        if m and depth == 0:
            keep = m.group(1) in test
            if keep:
                out.append(f'class {m.group(1)} {{')
        elif keep and depth == 1:
            m = re.match(r'^    public (?:static )?(?:(\S+(?:<[^(]*>)?(?:\[\])*) )?(\w+)\(([^)]*)\)\s*\{', line)
            if m and (m.group(2) in used or m.group(1) is None):
                ret = m.group(1)
                default = '' if ret is None else JAVA_DEFAULT.get(ret, 'return null;')
                body = f'        // {TODO}' + (f'\n        {default}' if default else '')
                out.append(f'{line[:line.index("{") + 1]}\n{body}\n    }}\n')
        depth += line.count('{') - line.count('}')
        if depth == 0 and keep and out and out[-1] != '}':
            out.append('}')
            keep = False
    return '\n'.join(out).rstrip() + '\n'


def cpp_stub(code, test):
    used = _called(test)
    out, depth, keep, public = [], 0, False, False
    for line in code.split('\n'):
        m = re.match(r'^class (\w+)', line)
        if m and depth == 0:
            keep = m.group(1) in test
            public = False
            if keep:
                out.append(f'class {m.group(1)} {{\npublic:')
        elif keep and depth == 1:
            if line.strip() == 'public:':
                public = True
            elif line.strip() in ('private:', 'protected:'):
                public = False
            elif public:
                m = re.match(r'^    (?:(\S.*?\S)\s+)?(\w+)\(([^)]*)\)\s*(?:const\s*)?(?::[^{]*)?\{', line)
                if m and (m.group(2) in used or m.group(1) is None):
                    ret = m.group(1)
                    tail = '' if ret in (None, 'void') else '\n        return {};'
                    head = re.sub(r'\)\s*:[^{]*\{$', ') {', line[:line.index('{') + 1])  # drop initializer lists
                    out.append(f'{head}\n        // {TODO}{tail}\n    }}\n')
        depth += line.count('{') - line.count('}')
        if depth == 0 and keep and out and out[-1] != '};':
            out.append('};')
            keep = False
    return '\n'.join(out).rstrip() + '\n'


def go_stub(code, test):
    used = _called(test)
    # The design class is whatever Constructor returns; tests only mention Constructor and the methods.
    types = set(re.findall(r'^func Constructor\(.*\) \*?(\w+) \{', code, re.M))
    out, depth = [], 0
    for line in code.split('\n'):
        if depth == 0:
            m = re.match(r'^type (\w+) struct \{', line)
            if m and (m.group(1) in test or m.group(1) in types):
                out.append(f'type {m.group(1)} struct {{\n\t// {TODO}\n}}\n')
            m = re.match(r'^func (?:\((\w+) \*?(\w+)\) )?(\w+)\((.*)\)\s*(.*?)\s*\{$', line)
            if m and (m.group(3) in used or m.group(3) == 'Constructor') and (not m.group(2) or m.group(2) in test or m.group(2) in types):
                out.append(f'{line}\n\t// {TODO}\n}}\n')
        depth += line.count('{') - line.count('}')
    return '\n'.join(out).rstrip() + '\n'


MAKERS = {'python': (python_stub, 'test.py'), 'javascript': (javascript_stub, 'test.js'), 'java': (java_stub, 'Main.java'),
          'cpp': (cpp_stub, 'test.cpp'), 'go': (go_stub, 'test.go')}


def stubs(slug, solutions):
    """solutions: {lang: code}. Returns {lang: stub}; a language without a recognisable signature gets ''."""
    result = {}
    for lang, (make, test_file) in MAKERS.items():
        test = _read(os.path.join(TESTS, slug, test_file))
        try:
            result[lang] = make(solutions.get(lang, ''), test)
        except (SyntaxError, ValueError):
            result[lang] = ''
    return result


if __name__ == '__main__':
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from check_interview import parse, solutions as parse_solutions, PROBLEMS
    for slug in sys.argv[1:]:
        code = parse_solutions(parse(os.path.join(PROBLEMS, slug + '.md'))[1])[0]
        for lang, stub in stubs(slug, code).items():
            print(f'--- {slug} [{lang}]\n{stub}')
