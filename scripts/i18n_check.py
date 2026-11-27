#!/usr/bin/env python3
"""List Chinese strings in site/data/*.json that site/i18n/en.json cannot translate.

Mirrors the front-end logic: a string without CJK passes through; otherwise an exact
`strings` entry wins, then `patterns` are tried in order and each captured group is
translated recursively before being substituted for $1, $2, ...

Usage: python scripts/i18n_check.py [--strict] [--unused]
  --strict  exit 1 if any string is untranslated
  --unused  also list `strings` keys that no data value uses
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CJK = re.compile("[一-鿿]")


def load_dict(path):
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    strings = d.get("strings", {})
    patterns = [(re.compile(p), r) for p, r in d.get("patterns", [])]
    return strings, patterns


def translate(s, strings, patterns, used=None, depth=0):
    """Return the English form of s, or None if some Chinese remains untranslated."""
    if not CJK.search(s):
        return s
    if s in strings:
        if used is not None:
            used.add(s)
        return strings[s]
    if depth > 8:
        return None
    for rx, repl in patterns:
        m = rx.match(s)
        if not m:
            continue
        groups = []
        for g in m.groups():
            t = translate(g or "", strings, patterns, used, depth + 1)
            if t is None:
                groups = None
                break
            groups.append(t)
        if groups is None:
            continue
        return re.sub(r"\$(\d)", lambda k: groups[int(k.group(1)) - 1], repl)
    return None


def walk(x, out):
    if isinstance(x, str):
        if CJK.search(x):
            out.add(x)
    elif isinstance(x, dict):
        for k, v in x.items():
            walk(k, out)
            walk(v, out)
    elif isinstance(x, list):
        for v in x:
            walk(v, out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--strict", action="store_true", help="exit 1 if anything is untranslated")
    ap.add_argument("--unused", action="store_true", help="also list unused `strings` keys")
    args = ap.parse_args()

    strings, patterns = load_dict(os.path.join(ROOT, "site", "i18n", "en.json"))
    found = set()
    for path in sorted(glob.glob(os.path.join(ROOT, "site", "data", "*.json"))):
        with open(path, encoding="utf-8") as f:
            walk(json.load(f), found)

    used = set()
    missing = sorted(s for s in found if translate(s, strings, patterns, used) is None)
    for s in missing:
        print(s)
    print(f"{len(missing)} untranslated of {len(found)} Chinese strings")

    if args.unused:
        # Count a key as used when a data string hits it directly or via a pattern group.
        unused = sorted(k for k in strings if k not in used)
        print(f"\n{len(unused)} unused strings keys:")
        for k in unused:
            print(k)

    return 1 if (args.strict and missing) else 0


if __name__ == "__main__":
    sys.exit(main())
