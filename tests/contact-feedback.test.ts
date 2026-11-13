import test from 'node:test';
import assert from 'node:assert/strict';
import {contactFailure} from '../src/lib/contact-feedback.ts';

test('provider validation identifies our fields without displaying provider-supplied markup', () => {
  const feedback = contactFailure(422, {errors: [
    {field: 'email', message: '<script>untrusted</script>'},
    {field: 'unknown-field'}, {field: 'email'}, {field: 'message'},
  ]});
  assert.deepEqual(feedback.fields, ['email', 'message']);
  assert.match(feedback.message, /highlighted fields/);
  assert.doesNotMatch(feedback.message, /script|untrusted/);
});

test('rate limits offer a wait rather than encouraging immediate retries', () => {
  const feedback = contactFailure(429, {errors: [{field: 'email'}]});
  assert.match(feedback.message, /Wait a few minutes/);
  assert.deepEqual(feedback.fields, []);
});

test('unavailable services and malformed responses retain an email recovery path', () => {
  for (const payload of [null, '', {errors: 'invalid'}, {errors: [null, 42]}]) {
    assert.deepEqual(contactFailure(503, payload).fields, []);
    assert.match(contactFailure(503, payload).message, /email me directly/);
    assert.match(contactFailure(400, payload).message, /message is still here/);
  }
  assert.match(contactFailure(413, {}).message, /Shorten/);
});
