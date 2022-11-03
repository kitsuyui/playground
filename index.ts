import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/action";

async function run() {
  try {
    const context = github.context;
    const octokit = new Octokit();
    const userLogin = await getUserLogin(octokit);
    const prNum = context.issue.number;
    const commitIds = await getCommitIds(octokit);

    const message = `\
# :tada: Lucky PR!

commit ids: ${JSON.stringify(commitIds)}
pr number: ${prNum}
`;

    await updateMessage(octokit, prNum, userLogin, {
      lucky: true,
      body: message,
    });
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

interface MessageContext {
  lucky: boolean;
  body: string;
}

interface Comment {
  id: number;
  body: string;
}

async function updateMessage(
  octokit: Octokit,
  prNum: number,
  userLogin: string,
  message: MessageContext
): Promise<void> {
  const context = github.context;
  const pastComment = await getFirstComment(octokit, prNum, userLogin);

  const { lucky, body } = message;
  if (lucky) {
    // if there is a comment from the current user and the message is different, update it
    if (pastComment && pastComment.body !== body) {
      await octokit.issues.updateComment({
        ...context.repo,
        comment_id: pastComment.id,
        body,
      });
    } else {
      // if there is no comment from the current user, create it
      await octokit.issues.createComment({
        ...context.repo,
        issue_number: prNum,
        body,
      });
    }
  } else {
    // if there is a comment from the current user, delete it
    if (pastComment) {
      await octokit.issues.deleteComment({
        ...context.repo,
        comment_id: pastComment.id,
      });
    }
  }
}

/**
 * Get the first comment of the current PR by the current user
 * @param octokit {Octokit} the octokit instance
 * @param prNum {number} the PR number
 * @param userLogin {string} the user login name
 * @returns comment id {LastComment}
 */
async function getFirstComment(
  octokit: Octokit,
  prNum: number,
  userLogin: string
): Promise<Comment | null> {
  const context = github.context;
  // get comments on the PR
  const comments = await octokit.issues.listComments({
    ...context.repo,
    issue_number: prNum,
  });
  // find the comment by the current user if it exists
  for (const comment of comments.data) {
    if (comment.user?.login === userLogin) {
      return {
        id: comment.id,
        body: comment.body_text || "",
      };
    }
  }
  return null;
}

/**
 * Get commit ids of the current PR
 * @param octokit {Octokit} the octokit instance
 * @returns commit ids {string[]}
 */
async function getCommitIds(octokit: Octokit): Promise<string[]> {
  const context = github.context;
  const commits = await octokit.pulls.listCommits({
    ...context.repo,
    pull_number: context.issue.number,
  });
  return commits.data.map((commit) => commit.sha);
}

/**
 * Get login name of the current user
 * By default, this returns `github-actions[bot]`
 * @param octokit {Octokit} the octokit instance
 * @returns user login {string}
 */
async function getUserLogin(octokit: Octokit) {
  const resp: any = await octokit.graphql(`
query {
  viewer {
    login
  }
}`);
  return resp.viewer.login;
}

if (require.main === module) {
  run().then(() => {});
}
