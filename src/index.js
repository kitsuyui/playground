export function plannedGreeting(name) {
  // TODO: Replace this placeholder once a real example is added.
  if (typeof name !== 'string') {
    throw new TypeError(`name must be a string, got ${typeof name}`);
  }
  if (name === '') {
    throw new RangeError('name must not be empty');
  }
  return `Hello, ${name}!`;
}
