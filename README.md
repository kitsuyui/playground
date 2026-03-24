# Here is my playground

![TODO badge](https://raw.githubusercontent.com/kitsuyui/playground/badge-assets/todo-badge.svg)

This repository includes an experimental GitHub Actions workflow that counts `TODO`
comments in source files, compares the count against the pull request merge base,
publishes the current main-branch count and badge SVG to the `badge-assets`
branch, and also uploads the generated files as workflow artifacts.
