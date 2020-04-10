import Policy from '../../src';

describe('Policy', () => {
  describe('.can', () => {
    test('returns false if no concern or child policy present', () => {
      const policy = new Policy();

      expect(
        policy
          .can(null)
          .perform('read')
          .on(null),
      ).toBe(false);
    });

    test('passes data to authorizer', () => {
      const policy = new Policy();
      const authorizer = jest.fn();
      const viewer = {};
      const entity = {};
      const value = {};
      const action = ':read';

      policy.register('read', authorizer);
      policy
        .can(viewer)
        .perform(action)
        .having(value)
        .on(entity);

      expect(authorizer).toHaveBeenCalledWith({
        viewer,
        entity,
        action,
        value,
      });
    });
  });

  describe('.register', () => {
    test('registers single concern', () => {
      const policy = new Policy();

      policy.register('read', () => true);

      expect(
        policy
          .can(null)
          .perform(':read')
          .on(null),
      ).toBe(true);
    });

    test('registers multiple concern', () => {
      const policy = new Policy();

      policy.register(['read', 'update'], () => true);

      expect(
        policy
          .can(null)
          .perform(':read')
          .on(null),
      ).toBe(true);

      expect(
        policy
          .can(null)
          .perform(':update')
          .on(null),
      ).toBe(true);
    });
  });

  describe('.include', () => {
    test('includes prebuilt policy', () => {
      const policy = new Policy();
      const userPolicy = new Policy();
      userPolicy.register('read', () => true);

      policy.include('user', userPolicy);

      expect(
        policy
          .can(null)
          .perform('user:read')
          .on(null),
      ).toBe(true);
    });

    test('calls policy builder', () => {
      const policy = new Policy();

      policy.include('user', p => p.register('read', () => true));

      expect(
        policy
          .can(null)
          .perform('user:read')
          .on(null),
      ).toBe(true);
    });

    test('includes single policy', () => {
      const policy = new Policy();

      policy.include('user', p => p.register('read', () => true));

      expect(
        policy
          .can(null)
          .perform('user:read')
          .on(null),
      ).toBe(true);
    });

    test('includes multiple policy', () => {
      const policy = new Policy();

      policy.include(['user', 'post'], p => p.register('read', () => true));

      expect(
        policy
          .can(null)
          .perform('user:read')
          .on(null),
      ).toBe(true);

      expect(
        policy
          .can(null)
          .perform('post:read')
          .on(null),
      ).toBe(true);
    });
  });
});
