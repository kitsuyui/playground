const core = require("@actions/core");
const { Octokit } = require("@octokit/action");
const github = require("@actions/github");

try {
  const prNum = core.getInput("PR_NUMBER");
  const context = github.context;
  // TODO
  const commitIds = [];

  if (!prNum) {
    core.setFailed("No pull request found.");
    return;
  }
  const octokit = new Octokit();
  const message = `\
# yay

commit ids: ${JSON.stringify(commitIds)}
pr number: ${prNum}`;

  octokit.issues.createComment({
    ...context.repo,
    issue_number: prNum,
    body: message,
  });
} catch (error) {
  core.setFailed(error.message);
}
