import { listReviews } from "./listReviews";

test("listReviews passes params to gateway", async () => {
    const reviewsGateway = { list: jest.fn().mockResolvedValue([{ id: 1 }]) };
    const run = listReviews({ reviewsGateway });

    const result = await run({ artist_id: "abc" });

    expect(reviewsGateway.list).toHaveBeenCalledWith({ artist_id: "abc" });
    expect(result).toEqual([{ id: 1 }]);
});
