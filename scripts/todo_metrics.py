#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path

SOURCE_SUFFIXES = {
    ".c",
    ".cc",
    ".cpp",
    ".css",
    ".go",
    ".h",
    ".hpp",
    ".html",
    ".java",
    ".js",
    ".json",
    ".jsx",
    ".mjs",
    ".py",
    ".rb",
    ".rs",
    ".sh",
    ".sql",
    ".swift",
    ".toml",
    ".ts",
    ".tsx",
    ".yaml",
    ".yml",
}
SOURCE_FILENAMES = {
    "Dockerfile",
    "Justfile",
    "justfile",
    "Makefile",
}
EXCLUDED_PARTS = {
    ".git",
    ".github",
    ".tmp",
    "coverage",
    "dist",
    "docs",
    "node_modules",
    "target",
}
COMMENT_MARKERS = ("//", "#", "/*", "*", "<!--", "--")


def run_git(args: list[str]) -> str:
    return subprocess.check_output(["git", *args], text=True)


def list_files(revision: str | None) -> list[str]:
    if revision:
        output = run_git(["ls-tree", "-r", "--name-only", revision])
        return [line for line in output.splitlines() if line]
    output = subprocess.check_output(
        ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"]
    )
    return [path.decode("utf-8") for path in output.split(b"\0") if path]


def is_source_file(path_str: str) -> bool:
    path = Path(path_str)
    if any(part in EXCLUDED_PARTS for part in path.parts):
        return False
    if path.name.startswith(".tmp"):
        return False
    if path.name in SOURCE_FILENAMES:
        return True
    return path.suffix.lower() in SOURCE_SUFFIXES


def is_todo_comment(line: str) -> bool:
    for marker in COMMENT_MARKERS:
        index = line.find(marker)
        if index < 0:
            continue
        prefix = line[:index]
        if any(quote in prefix for quote in ('"', "'", "`")):
            continue
        comment = line[index + len(marker) :].lstrip()
        if comment.startswith("TODO"):
            return True
    return False


def read_file(path: str, revision: str | None) -> str:
    if revision:
        return run_git(["show", f"{revision}:{path}"])
    return Path(path).read_text(encoding="utf-8")


def count_todos(revision: str | None) -> dict[str, object]:
    matches: list[dict[str, object]] = []
    for path in sorted(list_files(revision)):
        if not is_source_file(path):
            continue
        try:
            content = read_file(path, revision)
        except (OSError, subprocess.CalledProcessError, UnicodeDecodeError):
            continue
        for line_number, line in enumerate(content.splitlines(), start=1):
            if is_todo_comment(line):
                matches.append(
                    {
                        "path": path,
                        "line": line_number,
                        "text": line.strip(),
                    }
                )
    reference = revision or run_git(["rev-parse", "HEAD"]).strip()
    return {
        "count": len(matches),
        "reference": reference,
        "matches": matches,
    }


def render_badge(label: str, count: int) -> str:
    count_text = str(count)
    left_width = 62
    right_width = max(34, 10 + len(count_text) * 8)
    total_width = left_width + right_width
    right_x = left_width + right_width / 2
    color = "#2ea44f" if count == 0 else "#dbab09" if count < 5 else "#cf222e"
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{total_width}" height="20" role="img" aria-label="{label}: {count_text}">
<title>{label}: {count_text}</title>
<linearGradient id="smooth" x2="0" y2="100%">
<stop offset="0" stop-color="#fff" stop-opacity=".7"/>
<stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
<stop offset=".9" stop-opacity=".3"/>
<stop offset="1" stop-opacity=".5"/>
</linearGradient>
<clipPath id="round">
<rect width="{total_width}" height="20" rx="3" fill="#fff"/>
</clipPath>
<g clip-path="url(#round)">
<rect width="{left_width}" height="20" fill="#555"/>
<rect x="{left_width}" width="{right_width}" height="20" fill="{color}"/>
<rect width="{total_width}" height="20" fill="url(#smooth)"/>
</g>
<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
<text x="{left_width / 2}" y="15" fill="#010101" fill-opacity=".3">{label}</text>
<text x="{left_width / 2}" y="14">{label}</text>
<text x="{right_x}" y="15" fill="#010101" fill-opacity=".3">{count_text}</text>
<text x="{right_x}" y="14">{count_text}</text>
</g>
</svg>
"""


def command_count(args: argparse.Namespace) -> int:
    metrics = count_todos(args.rev)
    output = json.dumps(metrics, indent=2)
    if args.output:
        Path(args.output).write_text(output + "\n", encoding="utf-8")
    else:
        print(output)
    return 0


def command_badge(args: argparse.Namespace) -> int:
    metrics = json.loads(Path(args.input).read_text(encoding="utf-8"))
    svg = render_badge("TODOs", int(metrics["count"]))
    Path(args.output).write_text(svg, encoding="utf-8")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate TODO metrics.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    count_parser = subparsers.add_parser("count", help="Count TODOs in source files.")
    count_parser.add_argument("--rev", help="Git revision to inspect.")
    count_parser.add_argument("--output", help="Path to write the metrics JSON.")
    count_parser.set_defaults(func=command_count)

    badge_parser = subparsers.add_parser("badge", help="Render a badge SVG from metrics JSON.")
    badge_parser.add_argument("--input", required=True, help="Metrics JSON file.")
    badge_parser.add_argument("--output", required=True, help="Badge SVG output path.")
    badge_parser.set_defaults(func=command_badge)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
