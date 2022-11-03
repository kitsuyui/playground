import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/action";

async function run() {
  try {
    const context = github.context;
    const octokit = new Octokit();
    const prNum = context.issue.number;
    // TODO
    const botName = "github-actions[bot]";

    // get the current user id

    // const { data: user } = await octokit.request("GET /user");
    // const userId = user.id;
    const username = botName;

    // get comments on the PR
    const comments = await octokit.issues.listComments({
      ...context.repo,
      issue_number: prNum,
    });

    // get commits on the PR
    const commits = await octokit.pulls.listCommits({
      ...context.repo,
      pull_number: prNum,
    });

    const commitIds = commits.data.map((commit) => commit.sha);

    // find the comment by the current user if it exists
    let myCommentId = null;
    let userIds = [];
    for (const comment of comments.data) {
      userIds.push(comment.user?.id);
      userIds.push(comment.user?.name);
      if (comment.user?.name === username) {
        myCommentId = comment.id;
      }
    }

    const message = `\
# yay

commit ids: ${JSON.stringify(commitIds)}
user id: ${username}
my comment id: ${myCommentId}
pr number: ${prNum}
userIds: ${userIds}`;

    // if there is a comment from the current user, update it
    if (myCommentId) {
      await octokit.issues.updateComment({
        ...context.repo,
        comment_id: myCommentId,
        body: message,
      });
    } else {
      await octokit.issues.createComment({
        ...context.repo,
        issue_number: prNum,
        body: message,
      });
    }
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

if (require.main === module) {
  run().then(() => {});
}
