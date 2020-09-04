const core = require("@actions/core")
const github = require("@actions/github")

try {
  const payloadJSON = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payloadJSON}`)
  const payload = github.context.payload

  if (payload.client_payload.slash_command.args === undefined) {
    process.exit(1)
  }

  const cluster = payload.client_payload.slash_command.args.named.cluster
  const unnamedArgs = payload.client_payload.slash_command.args.unnamed.all
  const branch = payload.client_payload.slash_command.args.named.branch
  const commit = payload.client_payload.slash_command.args.named.commit
  const pullRequestID = payload.client_payload.slash_command.args.named.pr
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
    shortSHA = "xyz" // need to change this
    convertedBranch = branch.replace("/", "-")
    ref = branch
    imageTag = `${convertedBranch}-${shortSHA}`
  }

  core.setOutput("ref", ref)
  core.setOutput("image_tag", imageTag)
  core.setOutput("cluster", cluster)
  core.setOutput("short_sha", shortSHA)
} catch (error) {
  core.setFailed(error.message)
}
