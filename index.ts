import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/action";

function run() {
  try {
    const prNum = parseInt(core.getInput("PR_NUMBER"), 0);
    const context = github.context;
    const commitIds = [1, 2, 3];
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
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  run();
}
