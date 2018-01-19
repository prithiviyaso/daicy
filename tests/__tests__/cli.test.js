'use strict';

const path = require('path');
const stripAnsi = require('strip-ansi');

const ace = require('../runAceCLI');
const pkg = require('../../packages/ace-core/package');


describe('Running the CLI', () => {
  test('with no input should fail', () => {
    const { stdout, stderr, status } = ace([]);
    expect(status).toBe(1);
    expect(stderr.trim()).toMatchSnapshot();
    expect(stdout).toMatchSnapshot();
  });

  test('with the -h option should print help', () => {
    const { stdout, stderr, status } = ace(['-h']);
    expect(status).toBe(0);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
  });

  test('with the -v option should print the version number', () => {
    const { stdout, stderr, status } = ace(['-v']);
    expect(status).toBe(0);
    expect(stderr).toBe('');
    expect(stdout.trim()).toBe(pkg.version);
  });

  test('with the --version option should print the version number', () => {
    const { stdout, stderr, status } = ace(['--version']);
    expect(status).toBe(0);
    expect(stderr).toBe('');
    expect(stdout.trim()).toBe(pkg.version);
  });

  test('on a non-existant document should fail', () => {
    const { stdout, stderr, status } = ace(['unexisting.epub']);
    expect(status).toBe(1);
    expect(stdout.trim()).toMatchSnapshot();
    expect(stderr).toMatchSnapshot();
  });

  test('with -o pointing to an existing directory should fail', () => {
    const { stdout, stderr, status } = ace(['-o', 'report', 'foo'], {
      cwd: path.resolve(__dirname, '../data'),
    });
    expect(status).toBe(1);
    expect(stderr).toBe('');
    expect(stdout).toMatchSnapshot();
  });

  test('with --silent and no --outdir should print the JSON report to standard output', () => {
    const { stdout, stderr, status } = ace(['-s', 'base-epub-30'], {
      cwd: path.resolve(__dirname, '../data'),
    });
    expect(status).toBe(0);
    expect(stderr).toBe('');
    expect(() => JSON.parse(stdout)).not.toThrow(SyntaxError);
    const res = JSON.parse(stdout);
    expect(res).toMatchObject({ '@type': 'earl:report' });
  });

  describe('with a valid input', () => {
    test('raises no log warnings', () => {
      const { stdout, stderr, status } = ace(['base-epub-30'], {
        cwd: path.resolve(__dirname, '../data'),
      });
      const log = stripAnsi(stdout);
      expect(/^warn:/m.test(log)).toBe(false);
    });
  });

  describe('raises a warning', () => {
    test('when the EPUB Content Docs have unusual extensions', () => {
      const { stdout, stderr, status } = ace(['issue-122'], {
        cwd: path.resolve(__dirname, '../data'),
      });
      const log = stripAnsi(stdout);
      expect(/^warn:\s+Copying document with extension/m.test(log)).toBe(true);
    });
  });  

  /*test('with return-2-on-validation-error set to true should exit with return code 2', () => {
    // TODO this test won't work until we can specify the CLI option to enable returning 2 on violation(s)
    const { stdout, stderr, status } = ace(['has-violations'], {
      cwd: path.resolve(__dirname, '../data')
    });
    expect(status).toBe(2);
  });*/
});
