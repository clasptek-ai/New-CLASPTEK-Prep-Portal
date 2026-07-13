import { describe, test, expect, vi } from 'vitest';
import { redact, ConsoleLogger, NoopTracer, NoopMeter, NoopContextPropagator } from './index';

describe('Observability Unit Tests', () => {
  test('Sensitive keys are correctly redacted', () => {
    const payload = {
      username: 'student_john',
      password: 'secretpassword123',
      authToken: 'jwt-token-xyz',
      answerKey: 'A, B, C',
      meta: {
        rawCookie: 'sessionid=123',
        nestedSecret: 'mysecretkey',
      },
    };

    const cleaned = redact(payload);
    expect(cleaned.username).toBe('student_john');
    expect(cleaned.password).toBe('[REDACTED]');
    expect(cleaned.authToken).toBe('[REDACTED]');
    expect(cleaned.answerKey).toBe('[REDACTED]');
    expect(cleaned.meta.rawCookie).toBe('[REDACTED]');
    expect(cleaned.meta.nestedSecret).toBe('[REDACTED]');
  });

  test('ConsoleLogger formats production JSON messages', () => {
    const logSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const logger = new ConsoleLogger('TestModule', { env: 'production', configVersion: 'v1.2.0' });

    logger.info('Hello Production Logger', { correlationId: 'corr-99' });

    expect(logSpy).toHaveBeenCalled();
    const logText = logSpy.mock.calls[0][0];
    const parsed = JSON.parse(logText);
    expect(parsed.message).toBe('Hello Production Logger');
    expect(parsed.env).toBe('production');
    expect(parsed.configVersion).toBe('v1.2.0');
    expect(parsed.correlationId).toBe('corr-99');
    expect(parsed.module).toBe('TestModule');

    logSpy.mockRestore();
  });

  test('OpenTelemetry placeholder interfaces instantiate without failures', () => {
    const tracer = new NoopTracer();
    const meter = new NoopMeter();
    const propagator = new NoopContextPropagator();

    expect(tracer.startSpan('test-span')).toBeDefined();
    expect(meter.counter('test-counter')).toBeDefined();
    expect(propagator.extract({})).toEqual({});
  });
});
