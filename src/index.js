// @ts-check
const core = require('@actions/core')
const debug = require('debug')('should-run-github-action')

if (!process.env.GITHUB_EVENT) {
  console.log('GITHUB_EVENT is not defined')
  process.exit(0)
}
const ghEvent = JSON.parse(process.env.GITHUB_EVENT)
const getCheckboxText = core.getInput('checkbox_text', { required: true })

let branch
if (ghEvent.pull_request) {
  debug('pull_request event')
  branch = ghEvent.pull_request.head.ref
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
} else {
  debug('push event branch "%s"', ghEvent.ref)
  branch = ghEvent.ref.replace('refs/heads/', '')
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
}

if (ghEvent.action !== 'edited') {
  debug('GITHUB_EVENT.action is not edited')
  process.exit(0)
}

// TODO check if this was really an edit of the PR body
const bodyFrom = ghEvent.changes?.body?.from || ''
const bodyAfter = ghEvent.pull_request?.body || ''
debug('PR body before')
debug(bodyFrom)
debug('PR body after')
debug(bodyAfter)
const commit = ghEvent.pull_request.head.sha
debug('PR head commit SHA %s', commit)

const runTestsCheckboxUnfilled = `[ ] ${getCheckboxText}`
const runTestsCheckboxFilled = `[x] ${getCheckboxText}`
if (
  bodyFrom.includes(runTestsCheckboxUnfilled) &&
  bodyAfter.includes(runTestsCheckboxFilled)
) {
  console.log(
    'Should run GH action on branch "%s" and commit %s',
    branch,
    commit,
  )
  core.setOutput('shouldRun', true)
  core.setOutput('commit', commit)
} else {
  console.log('Should not run GH action')
}
