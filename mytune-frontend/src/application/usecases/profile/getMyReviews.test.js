import { getMyReviews } from "./getMyReviews";

test("getMyReviews returns profileGateway.myReviews()", async () => {
    const profileGateway = { myReviews: jest.fn().mockResolvedValue([{ id: 1 }]) };
    const run = getMyReviews({ profileGateway });

    const reviews = await run();
    expect(profileGateway.myReviews).toHaveBeenCalledTimes(1);
    expect(reviews).toEqual([{ id: 1 }]);
});
