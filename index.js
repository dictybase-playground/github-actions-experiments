const core = require("@actions/core")
const github = require("@actions/github")
const exec = require("@actions/exec")

const run = async () => {
  try {
    const payloadJSON = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payloadJSON}`)

    const {
      cluster,
      branch,
      commit,
      pr: pullRequestID,
    } = github.context.payload.client_payload.slash_command.args.named
    const unnamedArgs =
      github.context.payload.client_payload.slash_command.args.unnamed.all
    let shortSHA, ref, imageTag

    // if cluster wasn't passed, exit immediately
    if (cluster === undefined) {
      process.exit(1)
    }

    if (commit !== undefined) {
      ref = commit
      imageTag = shortSHA
      shortSHA = commit.substr(0, 7)
    }

    if (pullRequestID !== undefined) {
      shortSHA = commit.substr(0, 7)
      imageTag = `pr-${pullRequestID}-${shortSHA}`
      ref = commit
    }

    if (unnamedArgs.includes("pr") && commit === undefined) {
      const pullRequestNumber = payload.client_payload.pull_request.number
      const sha = payload.client_payload.pull_request.head.sha
      shortSHA = sha.substr(0, 7)
      imageTag = `pr-${pullRequestNumber}-${shortSHA}`
      ref = sha
    }

    if (unnamedArgs.includes("pr") && commit !== undefined) {
      const pullRequestNumber = payload.client_payload.pull_request.number
      shortSHA = commit.substr(0, 7)
      imageTag = `pr-${pullRequestNumber}-${shortSHA}`
      ref = commit
    }

    if (branch !== undefined) {
      await exec.exec("git", ["fetch", branch])
      shortSHA = await exec.exec("git", [
        "log",
        `origin/${branch}`,
        "-1",
        "--format=%h",
      ])
      convertedBranch = branch.replace("/", "-")
      ref = branch
      imageTag = `${convertedBranch}-${shortSHA}`
    }

    core.setOutput("ref", ref)
    core.setOutput("image_tag", imageTag)
    core.setOutput("cluster", cluster)
    core.setOutput("short_sha", shortSHA)
  } catch (error) {
    core.setFailed(`action failed with error ${error.message}`)
  }
}

run()
