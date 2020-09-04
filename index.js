const core = require("@actions/core")
const github = require("@actions/github")

try {
  const payload = JSON.stringify(github.context.payload, undefined, 2)
  console.log(`The event payload: ${payload}`)
  const cluster = payload.event.client_payload.slash_command.args.named.cluster
  const unnamedArgs =
    payload.event.client_payload.slash_command.args.unnamed.all
  const branch = payload.event.client_payload.slash_command.args.named.branch
  const commit = payload.event.client_payload.slash_command.args.named.commit
  const pullRequestID = payload.event.client_payload.slash_command.args.named.pr
  const sha = payload.event.client_payload.pull_request.head.sha
  const pullRequestNumber = payload.event.client_payload.pull_request.number
  let shortSHA = commit.substr(0, 7)
  let ref = commit
  let imageTag = commit

  // if cluster wasn't passed, exit immediately
  if (cluster === "") {
    process.exit(1)
  }

  if (commit.length > 0) {
    ref = commit
    imageTag = shortSHA
  }

  if (pullRequestID.length > 0) {
    imageTag = `pr-${pullRequestID}-${shortSHA}`
    ref = commit
  }

  if (unnamedArgs.includes("pr") && commit === "") {
    shortSHA = sha.substr(0, 7)
    pullRequestID = pullRequestNumber
    imageTag = `pr-${pullRequestID}-${shortSHA}`
    ref = sha
  }

  if (unnamedArgs.includes("pr") && commit.length > 0) {
    pullRequestID = pullRequestNumber
    imageTag = `pr-${pullRequestID}-${shortSHA}`
    ref = commit
  }

  if (branch.length > 0) {
    shortSHA = commit // need to change this
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
