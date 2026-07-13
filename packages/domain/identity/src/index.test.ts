import { describe, test, expect } from 'vitest';
import {
  User,
  UserId,
  Profile,
  ProfileId,
  EmailAddress,
  PersonName,
  UserIsEditableSpecification,
  ProfileCompleteSpecification,
  IdentityPolicy,
} from './index';

describe('Identity Domain Unit Tests', () => {
  const userUUID = '00000000-0000-0000-0000-000000000001';
  const profileUUID = '00000000-0000-0000-0000-000000000003';

  test('Value Objects enforce validation rules', () => {
    // Valid inputs
    expect(new EmailAddress('TEST@DOMAIN.COM').value).toBe('test@domain.com');
    expect(new PersonName('John').value).toBe('John');
    expect(new UserId(userUUID).value).toBe(userUUID);

    // Invalid inputs
    expect(() => new EmailAddress('invalid-email')).toThrow();
    expect(() => new PersonName('')).toThrow();
    expect(() => new UserId('invalid-uuid')).toThrow();
  });

  test('User Aggregate lifecycle state machine allowed transitions', () => {
    const user = new User(new UserId(userUUID), 'INVITED', [], null);
    expect(user.status).toBe('INVITED');

    user.transitionTo('CREATED');
    expect(user.status).toBe('CREATED');

    user.transitionTo('ACTIVE');
    expect(user.status).toBe('ACTIVE');

    user.transitionTo('SUSPENDED');
    expect(user.status).toBe('SUSPENDED');

    user.transitionTo('ACTIVE');
    expect(user.status).toBe('ACTIVE');

    user.transitionTo('ARCHIVED');
    expect(user.status).toBe('ARCHIVED');

    user.transitionTo('ACTIVE');
    expect(user.status).toBe('ACTIVE');
  });

  test('User Aggregate state machine blocks illegal transitions', () => {
    const user = new User(new UserId(userUUID), 'INVITED', [], null);
    expect(() => user.transitionTo('ARCHIVED')).toThrow();
    expect(() => user.transitionTo('SUSPENDED')).toThrow();
  });

  test('Specifications enforce constraints correctly', () => {
    const editableSpec = new UserIsEditableSpecification();
    const completeSpec = new ProfileCompleteSpecification();

    const activeUser = new User(new UserId(userUUID), 'ACTIVE', [], null);
    const archivedUser = new User(new UserId(userUUID), 'ARCHIVED', [], null);

    expect(editableSpec.isSatisfiedBy(activeUser)).toBe(true);
    expect(editableSpec.isSatisfiedBy(archivedUser)).toBe(false);

    const completeProfile = new Profile(
      new ProfileId(profileUUID),
      new PersonName('John'),
      new PersonName('Doe')
    );
    expect(completeSpec.isSatisfiedBy(completeProfile)).toBe(true);
  });

  test('IdentityPolicy blocks invalid archive requests', () => {
    const targetUser = new User(new UserId(userUUID), 'ACTIVE', [], null);
    const adminUser = new User(
      new UserId('00000000-0000-0000-0000-000000000000'),
      'ACTIVE',
      [],
      null
    );

    // Cannot archive super-admin
    expect(() => IdentityPolicy.canArchiveUser('actor-1', adminUser)).toThrow(
      'Cannot archive the system administrator account'
    );

    // Users cannot self-archive
    expect(() => IdentityPolicy.canArchiveUser(userUUID, targetUser)).toThrow(
      'Users cannot self-archive their active workspace profiles'
    );

    // Valid archiving passes
    expect(IdentityPolicy.canArchiveUser('actor-uuid-999', targetUser)).toBe(true);
  });
});
