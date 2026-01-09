import { getArtist } from "./getArtist";

test("getArtist calls spotifyGateway.getArtist", async () => {
    const spotifyGateway = { getArtist: jest.fn().mockResolvedValue({ id: "a" }) };
    const run = getArtist({ spotifyGateway });

    const res = await run("a");

    expect(spotifyGateway.getArtist).toHaveBeenCalledWith("a");
    expect(res).toEqual({ id: "a" });
});
