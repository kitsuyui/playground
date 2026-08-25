export function plannedGreeting(name) {
  if (typeof name !== 'string') {
    throw new TypeError(`name must be a string, got ${typeof name}`);
  }
  return `Hello, ${name}!`;
}
