import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/action";

function run() {
  try {
    const context = github.context;
    const commitIds = [1, 2, 3];
    const octokit = new Octokit();
    const message = `\
# yay

commit ids: ${JSON.stringify(commitIds)}
pr number: ${context.issue.number}`;
    octokit.issues.createComment({
      ...context.repo,
      issue_number: context.issue.number,
      body: message,
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  run();
}
