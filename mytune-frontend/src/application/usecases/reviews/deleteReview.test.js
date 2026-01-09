import { deleteReview } from './deleteReview';

test('deleteReview calls gateway.delete', async () => {
  const reviewsGateway = { delete: jest.fn().mockResolvedValue(undefined) };
  const run = deleteReview({ reviewsGateway });

  await run(123);

  expect(reviewsGateway.delete).toHaveBeenCalledWith(123);
});
