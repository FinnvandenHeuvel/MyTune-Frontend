import { createReview } from "./createReview";

test("createReview passes payload to gateway", async () => {
    const reviewsGateway = { create: jest.fn().mockResolvedValue({ id: 10 }) };
    const run = createReview({ reviewsGateway });

    const payload = { title: "t", artist: "a", content: "c", rating: 5 };
    const result = await run(payload);

    expect(reviewsGateway.create).toHaveBeenCalledWith(payload);
    expect(result).toEqual({ id: 10 });
});
