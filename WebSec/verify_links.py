#!/usr/bin/env python3
"""
WebSec Link Integrity Verifier
Scans all HTML files in WebSec to ensure 100% of internal links resolve to existing files.
"""

import os
import re
import sys

def verify():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    errors = []
    total_files = 0
    total_links = 0

    for root, dirs, files in os.walk(base_dir):
        if ".git" in root:
            continue
        for f in files:
            if f.endswith(".html"):
                total_files += 1
                fpath = os.path.join(root, f)
                with open(fpath, "r", encoding="utf-8", errors="ignore") as fp:
                    content = fp.read()
                matches = re.findall(r"""href=["']([^#'"\s]+?\.html(?:[?#][^"']*)?)["']""", content, re.IGNORECASE)
                for m in matches:
                    total_links += 1
                    clean = m.split("#")[0].split("?")[0].strip()
                    target_disk_path = os.path.normpath(os.path.join(root, clean))
                    if not os.path.exists(target_disk_path):
                        rel_source = os.path.relpath(fpath, base_dir)
                        errors.append((rel_source, m, os.path.relpath(target_disk_path, base_dir)))

    print(f"Scanned {total_files} HTML files and {total_links} internal links.")
    if errors:
        print(f"❌ Found {len(errors)} broken link(s):")
        for src, link, resolved in errors:
            print(f"   In '{src}' -> '{link}' (Missing target: '{resolved}')")
        sys.exit(1)
    else:
        print("✅ Success: All internal links are valid and verified! Zero broken links.")
        sys.exit(0)

if __name__ == "__main__":
    verify()
