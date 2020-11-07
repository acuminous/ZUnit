const assert = require('assert');
const { describe, NullReporter, Test } = require('..');

describe('Tests', ({ it }) => {

  const reporter = new NullReporter();

  it('should run successful asynchronous tests', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve) => setTimeout(resolve, 100));
    });

    await test.run(reporter);

    assert.equal(test.passed, true);
    assert.ok(test.duration >= 100);
  });

  it('should run failing asynchronous tests', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Oh Noes!')), 100);
      });
    });

    await test.run(reporter);

    assert.equal(test.failed, true);
    assert.equal(test.error.message, 'Oh Noes!');
  });

  it('should abort slow asynchronous tests (runner)', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve) => setTimeout(resolve, 200));
    });

    await test.run(reporter, { timeout: 100 });

    assert.equal(test.failed, true);
    assert.equal(test.error.message, 'Timed out after 100ms');
  });

  it('should abort slow tests (configuration)', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve) => setTimeout(resolve, 200));
    }, { timeout: 100 });

    await test.run(reporter);

    assert.equal(test.failed, true);
    assert.equal(test.error.message, 'Timed out after 100ms');
  });

  it('should bypass skipped tests (runner)', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Oh Noes!')), 100);
      });
    });

    await test.run(reporter, { skip: true });

    assert.equal(test.skipped, true);
  });

  it('should bypass skipped tests (configuration)', async () => {
    const test = new Test('Test', () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => reject(new Error('Oh Noes!')), 100);
      });
    }, { skip: true });

    await test.run(reporter);

    assert.equal(test.skipped, true);
  });

  it('should bypass skipped tests (programmatic)', async () => {
    const test = new Test('Test', (t) => {
      return new Promise((resolve) => {
        t.skip();
        resolve();
      });
    });

    await test.run(reporter);

    assert.equal(test.skipped, true);
  });

  it('should bypass skipped tests (pending)', async () => {
    const test = new Test('Test');

    await test.run(reporter);

    assert.equal(test.skipped, true);
  });

  it('should timeout unresolved promises', async () => {
    const test = new Test('Test', () => {
      return new Promise(() => {});
    }, { timeout: 200 });

    await test.run(reporter);

    assert.equal(test.failed, true);
    assert.equal(test.error.message, 'Timed out after 200ms');
  });

  it('should finalise a test', async () => {
    const test = new Test('Test', () => {}, { exclusive: true });
    const finalised = test.finalise(99);

    await finalised.run(reporter);

    assert.equal(test.name, 'Test');
    assert.equal(test.number, undefined);
    assert.equal(test.passed, false);

    assert.equal(finalised.name, 'Test');
    assert.equal(finalised.number, 99);
    assert.equal(finalised.passed, true);
  });

});

