import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const bash = process.platform === 'win32'
  ? 'C:/Program Files/Git/bin/bash.exe'
  : 'bash';
const workflow = readFileSync(new URL('../.github/workflows/fetch-tv-data.yaml', import.meta.url), 'utf8');
const commitStep = workflow.split('      - name: Commit updated data')[1];
const pushScript = commitStep.split('        run: |')[1].trimEnd()
  .split(/\r?\n/).slice(1).map(line => line.slice(10)).join('\n');

function runScenario(t, scenario) {
  const directory = mkdtempSync(join(tmpdir(), 'charts-workflow-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const result = spawnSync(bash, ['--noprofile', '--norc', '-s'], {
    cwd: directory,
    encoding: 'utf8',
    env: {
      ...process.env,
      GIT_CONFIG_GLOBAL: '/dev/null',
      GIT_CONFIG_NOSYSTEM: '1',
      GIT_AUTHOR_NAME: 'Workflow test',
      GIT_AUTHOR_EMAIL: 'test@example.com',
      GIT_COMMITTER_NAME: 'Workflow test',
      GIT_COMMITTER_EMAIL: 'test@example.com',
    },
    input: `set -euo pipefail
git init --bare --initial-branch=main remote.git
git clone remote.git runner
cd runner
mkdir -p front/available-markets
echo original > front/available-markets/data.json
echo original-code > front/app.txt
git add .
git commit -m Initial
git push origin main
cd ..
git clone remote.git editor
cd runner
export TARGET_BRANCH=main
export GITHUB_OUTPUT=../outputs
sleep() { :; }
advance_remote() {
  (
    cd ../editor
    echo newer-code > front/app.txt
    echo other-data > front/available-markets/data.json
    git add .
    git commit -m 'Concurrent changes'
    git push origin main
  )
}
${scenario}
${pushScript}
`,
    timeout: 30000,
  });
  return { directory, result };
}

const options = { skip: process.platform === 'win32' && !existsSync(bash) };

test('data push preserves code committed during the long fetch', options, t => {
  const { directory, result } = runScenario(t, `advance_remote
echo generated-data > front/available-markets/data.json`);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(readFileSync(join(directory, 'runner/front/app.txt'), 'utf8').trim(), 'newer-code');
  assert.equal(readFileSync(join(directory, 'runner/front/available-markets/data.json'), 'utf8').trim(), 'generated-data');
  assert.equal(readFileSync(join(directory, 'outputs'), 'utf8').trim(), 'changes_detected=true');
});

test('data push retries when the remote changes between fetch and push', options, t => {
  const { directory, result } = runScenario(t, `echo generated-data > front/available-markets/data.json
raced=false
git() {
  if [ "\${1:-}" = push ] && [ "$raced" = false ]; then
    raced=true
    advance_remote
  fi
  command git "$@"
}`);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Push attempt 1 failed/);
  assert.equal(readFileSync(join(directory, 'runner/front/app.txt'), 'utf8').trim(), 'newer-code');
  assert.equal(readFileSync(join(directory, 'runner/front/available-markets/data.json'), 'utf8').trim(), 'generated-data');
  assert.equal(readFileSync(join(directory, 'outputs'), 'utf8').trim(), 'changes_detected=true');
});

test('unchanged data skips committing', options, t => {
  const { directory, result } = runScenario(t, 'advance_remote\necho other-data > front/available-markets/data.json');
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(readFileSync(join(directory, 'outputs'), 'utf8').trim(), 'changes_detected=false');
});

test('persistent push failure stops after five attempts', options, t => {
  const { directory, result } = runScenario(t, `echo generated-data > front/available-markets/data.json
git() {
  if [ "\${1:-}" = push ]; then
    echo rejected >> ../push-attempts
    return 1
  fi
  command git "$@"
}`);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stdout, /Could not push updated markets data after 5 attempts/);
  assert.equal(readFileSync(join(directory, 'push-attempts'), 'utf8').trim().split('\n').length, 5);
  assert.equal(existsSync(join(directory, 'outputs')), false);
});
