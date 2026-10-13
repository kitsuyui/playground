function logEvent(level, event, fields = {}) {
  const payload = { level, event, ts: new Date().toISOString(), ...fields };
  const line = JSON.stringify(payload);
  if (level === 'error') {
    console.error(line);
  } else {
    console.info(line);
  }
}

export function plannedGreeting(name) {
  if (typeof name !== 'string') {
    // Omit the raw `name` value: it is caller-supplied and may carry
    // sensitive content, so only its type is recorded.
    logEvent('error', 'planned_greeting.invalid_input', { nameType: typeof name });
    throw new TypeError(`name must be a string, got ${typeof name}`);
  }
  logEvent('info', 'planned_greeting.success', { nameLength: name.length });
  return `Hello, ${name}!`;
}
