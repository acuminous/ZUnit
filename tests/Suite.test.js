const assert = require('assert');
const { describe, GraphReporter, NullReporter, Suite, Test, RunnableOutcomes } = require('..');

describe('Suites', ({ it }) => {

  const reporter = new NullReporter();

  it('should report successful tests', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass);
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.passed, true);
    assert.equal(test1.passed, true);
    assert.equal(test2.passed, true);
  });

  it('should report failing tests', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', fail);
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.failed, true);
    assert.equal(test1.passed, true);
    assert.equal(test2.failed, true);
  });

  it('should skip all tests in the test run', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', fail);
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter, { skip: true });

    assert.equal(suite.skipped, true);
    assert.equal(test1.skipped, true);
    assert.equal(test2.skipped, true);
  });

  it('should skip the entire test suite', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', fail);
    const suite = new Suite('Test Suite', { skip: true }).add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.skipped, true);
    assert.equal(test1.skipped, true);
    assert.equal(test2.skipped, true);
  });

  it('should skip individual tests', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass, { skip: true });
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.passed, true);
    assert.equal(test1.passed, true);
    assert.equal(test2.skipped, true);
  });

  it('should abort early (runner)', async () => {
    const test1 = new Test('Test 1', fail);
    const test2 = new Test('Test 2', pass);
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter, { abort: true });

    assert.equal(suite.failed, true);
    assert.equal(test1.failed, true);
    assert.equal(test2.skipped, true);
  });

  it('should aborting early (configuration)', async () => {
    const test1 = new Test('Test 1', fail);
    const test2 = new Test('Test 2', pass);
    const suite = new Suite('Test Suite', { abort: true }).add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.failed, true);
    assert.equal(test1.failed, true);
    assert.equal(test2.skipped, true);
  });

  it('should only run exclusive tests (test configuration)', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass, { exclusive: true });
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter, {}, false);

    assert.equal(suite.stats.passed, 1);
    assert.equal(suite.stats.failed, 0);
    assert.equal(suite.stats.skipped, 0);
  });

  it('should only run exclusive tests (suite configuration)', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass);
    const test3 = new Test('Test 3', fail);
    const child1 = new Suite('Child 1', { exclusive: true }).add(test1, test2);
    const child2 = new Suite('Child 2').add(test3);
    const parent = new Suite('Parent').add(child1, child2);

    await parent.run(reporter, {}, false);

    assert.equal(parent.stats.passed, 2);
    assert.equal(parent.stats.failed, 0);
    assert.equal(parent.stats.skipped, 0);
  });

  it('should only run exclusive tests (suite and test configuration)', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass, { exclusive: true });
    const test3 = new Test('Test 3', fail);
    const child1 = new Suite('Child 1', { exclusive: true }).add(test1, test2);
    const child2 = new Suite('Child 2').add(test3);
    const parent = new Suite('Parent').add(child1, child2);

    await parent.run(reporter, {}, false);

    assert.equal(parent.stats.passed, 1);
    assert.equal(parent.stats.failed, 0);
    assert.equal(parent.stats.skipped, 0);
  });

  it('should skip exclusive tests', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass, { skip: true, exclusive: true });
    const suite = new Suite('Test Suite').add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.passed, true);
    assert.equal(test1.passed, true);
    assert.equal(test2.skipped, true);
  });

  it('should skip the exclusive test suites', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', fail);
    const suite = new Suite('Test Suite', { skip: true, exclusive: true }).add(test1, test2);

    await suite.run(reporter);

    assert.equal(suite.skipped, true);
    assert.equal(test1.skipped, true);
    assert.equal(test2.skipped, true);
  });

  it('should support nesting', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', fail);
    const test3 = new Test('Test 3', pass);
    const child1 = new Suite('Child 1').add(test1, test2);
    const child2 = new Suite('Child 2').add(test3);
    const parent = new Suite('Parent').add(child1, child2);

    await parent.run(reporter);

    assert.equal(parent.passed, false);
    assert.equal(parent.name, 'Parent');
    assert.equal(parent.stats.passed, 2);
    assert.equal(parent.stats.failed, 1);
    assert.equal(parent.stats.skipped, 0);

    assert.equal(child1.name, 'Child 1');
    assert.equal(child1.passed, false);
    assert.equal(child1.stats.passed, 1);
    assert.equal(child1.stats.failed, 1);
    assert.equal(child1.stats.skipped, 0);

    assert.equal(child2.name, 'Child 2');
    assert.equal(child2.passed, true);
    assert.equal(child2.stats.passed, 1);
    assert.equal(child2.stats.failed, 0);
    assert.equal(child2.stats.skipped, 0);

    assert.equal(test1.name, 'Test 1');
    assert.equal(test1.passed, true);
    assert.equal(test2.name, 'Test 2');
    assert.equal(test2.failed, true);
    assert.equal(test3.name, 'Test 3');
    assert.equal(test3.passed, true);
  });

  it('should finalise a suite of tests', async () => {
    const test1 = new Test('Test 1', pass);
    const test2 = new Test('Test 2', pass);
    const test3 = new Test('Test 3', pass);
    const child1 = new Suite('Child 1').add(test1, test2);
    const child2 = new Suite('Child 2').add(test3);
    const parent = new Suite('Parent').add(child1, child2);

    const reporter = new GraphReporter();
    const finalised = parent.finalise();
    await finalised.run(reporter);

    assert.equal(parent.passed, false);
    assert.equal(child1.passed, false);
    assert.equal(child2.passed, false);
    assert.equal(test1.passed, false);
    assert.equal(test1.number, undefined);
    assert.equal(test2.passed, false);
    assert.equal(test2.number, undefined);
    assert.equal(test3.passed, false);
    assert.equal(test3.number, undefined);

    const graph = reporter.toGraph();
    assert.equal(graph.name, 'Parent');
    assert.equal(graph.result, RunnableOutcomes.PASSED);
    assert.equal(graph.resolve(0, 0).name, 'Test 1');
    assert.equal(graph.resolve(0, 0).number, 1);
    assert.equal(graph.resolve(0, 1).result, RunnableOutcomes.PASSED);
    assert.equal(graph.resolve(0, 1).name, 'Test 2');
    assert.equal(graph.resolve(0, 1).number, 2);
    assert.equal(graph.resolve(0, 0).result, RunnableOutcomes.PASSED);
    assert.equal(graph.resolve(1, 0).name, 'Test 3');
    assert.equal(graph.resolve(1, 0).number, 3);
    assert.equal(graph.resolve(1, 0).result, RunnableOutcomes.PASSED);
  });
});

function pass() {
  return Promise.resolve();
}

function fail() {
  return new Promise((resolve, reject) => reject(new Error('Oh Noes!')));
}

