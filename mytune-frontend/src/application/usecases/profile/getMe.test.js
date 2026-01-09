import { getMe } from './getMe';

test('getMe returns profileGateway.me()', async () => {
  const profileGateway = { me: jest.fn().mockResolvedValue({ username: 'x' }) };
  const run = getMe({ profileGateway });

  const me = await run();
  expect(profileGateway.me).toHaveBeenCalledTimes(1);
  expect(me).toEqual({ username: 'x' });
});
