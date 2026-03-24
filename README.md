# Here is my playground

![TODO badge](https://raw.githubusercontent.com/kitsuyui/playground/badge-assets/todo-badge.svg)

This repository includes an experimental GitHub Actions workflow that counts `TODO`
comments in source files, compares the count against the pull request merge base,
publishes the current main-branch count and badge SVG to the `badge-assets`
branch, and also uploads the generated files as workflow artifacts.

## How it works

1. On pull requests, GitHub Actions counts `TODO` comments on the PR head and on
   the merge base against `main`.
2. The workflow posts the delta as a pull request comment.
3. On pushes to `main`, the workflow regenerates `current.json` and
   `todo-badge.svg`.
4. The workflow uploads those files as workflow artifacts.
5. The workflow also force-replaces the contents of the `badge-assets` branch
   with only `current.json` and `todo-badge.svg`.
6. The README badge points at the raw file on `badge-assets`, which gives the
   badge a stable URL.

## Constraints

- Workflow artifacts are designed for storing workflow output and for sharing
  data between jobs or after a run. They are not a good stable README badge
  origin because artifact access is tied to workflow runs and download flows.
- The workflow needs `contents: write` permission because it pushes generated
  files to the dedicated `badge-assets` branch.
- Commits pushed with `GITHUB_TOKEN` do not trigger another workflow run, which
  prevents an infinite loop when the workflow updates `badge-assets`.
- If `badge-assets` is protected, the workflow bot must be allowed to push there
  or the publish step will fail.
- The dedicated asset branch should be treated as generated output only. This
  workflow intentionally replaces that branch with just `current.json` and
  `todo-badge.svg` on every publish.

## Reproducing this pattern

1. Generate the metric output you need on `push` to `main`.
2. Upload the generated files as workflow artifacts if you still want them
   attached to workflow runs.
3. Create a dedicated branch such as `badge-assets` for published generated
   files.
4. In the workflow, check out or create that branch, remove its existing
   tracked files, copy in only the generated assets, commit, and push.
5. Point your README badge at the raw file on that branch, for example:

```md
![TODO badge](https://raw.githubusercontent.com/<owner>/<repo>/badge-assets/todo-badge.svg)
```

## Official references

- [Store and share data with workflow artifacts](https://docs.github.com/actions/writing-workflows/choosing-what-your-workflow-does/storing-and-sharing-data-from-a-workflow)
- [Workflow artifacts](https://docs.github.com/en/actions/concepts/workflows-and-actions/workflow-artifacts)
- [Use GITHUB_TOKEN for authentication in workflows](https://docs.github.com/en/actions/configuring-and-managing-workflows/authenticating-with-the-github_token)
- [GITHUB_TOKEN](https://docs.github.com/actions/concepts/security/github_token)
- [Managing GitHub Actions settings for a repository](https://docs.github.com/github/administering-a-repository/managing-repository-settings/disabling-or-limiting-github-actions-for-a-repository)
- [REST API endpoints for repository contents](https://docs.github.com/en/rest/repos/contents)
