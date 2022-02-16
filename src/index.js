const core = require('@actions/core')
const debug = require('debug')('should-run-github-action')

if (!process.env.GITHUB_EVENT) {
  console.log('GITHUB_EVENT is not defined')
  process.exit(0)
}
const ghEvent = JSON.parse(process.env.GITHUB_EVENT)

if (ghEvent.pull_request) {
  debug('pull_request event')
  const branch = ghEvent.pull_request.head.ref
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
} else {
  debug('push event branch "%s"', ghEvent.ref)
  const branch = ghEvent.ref.replace('refs/heads/', '')
  debug('branch "%s"', branch)
  core.setOutput('branch', branch)
}

if (ghEvent.action !== 'edited') {
  debug('GITHUB_EVENT.action is not edited')
  process.exit(0)
}

// TODO check if this was really an edit of the PR body
debug('PR body before')
debug(ghEvent.changes.body.from)
debug('PR body after')
debug(ghEvent.pull_request.body)

const runTestsCheckboxUnfilled = '[ ] re-run the tests'
const runTestsCheckboxFilled = '[x] re-run the tests'
if (
  ghEvent.changes.body.from.includes(runTestsCheckboxUnfilled) &&
  ghEvent.pull_request.body.includes(runTestsCheckboxFilled)
) {
  console.log('Should run GH action')
  core.setOutput('shouldRun', true)
} else {
  console.log('Should not run GH action')
}
