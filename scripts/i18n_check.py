#!/usr/bin/env python3
"""List Chinese strings in site/data/*.json that site/i18n/en.json cannot translate.

Mirrors the front-end logic (trans() and D() in site/app.js): a string without ideographs
passes through, except that full-width punctuation in it is switched to ASCII; otherwise
an exact `strings` entry wins, then `patterns` are tried in order and each captured group
is translated recursively before being substituted for $1, $2, ...

It also lists every data string whose English form still contains an ideograph or
full-width punctuation (U+3000-303F, U+FF00-FFEF).

Usage: python scripts/i18n_check.py [--strict] [--unused]
  --strict  exit 1 if any string is untranslated or its English still has Chinese text or punctuation
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
# Full-width punctuation that ascii_punct() rewrites (FW_PUNCT in site/app.js), and the wider
# CJK-punctuation / full-width-forms blocks that must not survive into an English string.
FW_PUNCT = re.compile("[（）、，。；：]")
FW = re.compile("[\u3000-\u303f\uff00-\uffef]")


def ascii_punct(s):
    """Same as asciiPunct() in site/app.js."""
    s = re.sub(" *（", " (", s)
    s = s.replace("）", ")")
    s = re.sub("[、，] *", ", ", s)
    s = re.sub("； *", "; ", s)
    s = re.sub("： *", ": ", s)
    s = re.sub("。 *", ". ", s)
    return re.sub("^ +| +$", "", s)


def load_dict(path):
    with open(path, encoding="utf-8") as f:
        d = json.load(f)
    strings = d.get("strings", {})
    patterns = [(re.compile(p), r) for p, r in d.get("patterns", [])]
    return strings, patterns


def translate(s, strings, patterns, used=None, depth=0):
    """Return the English form of s, or None if some Chinese remains untranslated."""
    if not CJK.search(s):
        return ascii_punct(s) if FW_PUNCT.search(s) else s
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
        if CJK.search(x) or FW.search(x):
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
    missing, leftover = [], []
    for s in sorted(found):
        t = translate(s, strings, patterns, used)
        if t is None:
            missing.append(s)
        elif CJK.search(t) or FW.search(t):
            leftover.append((s, t))
    for s in missing:
        print(s)
    print(f"{len(missing)} untranslated of {len(found)} strings with Chinese text or full-width punctuation")
    if leftover:
        print()
        for s, t in leftover:
            print(f"{s}\t-> {t}")
    print(f"{len(leftover)} English results still contain Chinese text or full-width punctuation")

    if args.unused:
        # Count a key as used when a data string hits it directly or via a pattern group.
        unused = sorted(k for k in strings if k not in used)
        print(f"\n{len(unused)} unused strings keys:")
        for k in unused:
            print(k)

    return 1 if (args.strict and (missing or leftover)) else 0


if __name__ == "__main__":
    sys.exit(main())
