const clientHelper = require('../../src/client-helper');
const JobStatus = require('../../../../dist/src/models/JobStatus').JobStatus;
const client = clientHelper.getSentimentAnalysisClient();
const fs = require('fs');

test('Can submit sentiment analysis job from text', async () => {
    const text = 'An umbrella or parasol is a folding canopy supported by wooden or metal ribs that is \
    usually mounted on a wooden, metal, or plastic pole. It is designed to protect a person \
    against rain or sunlight. The term umbrella is traditionally used when protecting oneself from \
    rain, with parasol used when protecting oneself from sunlight, though the terms continue to be \
    used interchangeably. Often the difference is the material used for the canopy; some parasols \
    are not waterproof, and some umbrellas are transparent. Umbrella canopies may be made of \
    fabric or flexible plastic. There are also combinations of parasol and umbrella that are \
    called en-tout-cas (French for \'in any case\').'
    const res = await client.submitJobFromText(text);

    expect(res.status).toBe(JobStatus.InProgress);
    expect(res.created_on).not.toBeNull();
    expect(res.id).not.toBeNull();
    expect(res.failure).toBeUndefined();
}, 30000);

test('Can submit sentiment analysis job from json', async () => {
    const rawdata = fs.readFileSync('./test/integration/resources/transcript.json');
    const transcriptJson = JSON.parse(rawdata);

    const res = await client.submitJobFromJson(transcriptJson);

    expect(res.status).toBe(JobStatus.InProgress);
    expect(res.created_on).not.toBeNull();
    expect(res.id).not.toBeNull();
    expect(res.failure).toBeUndefined();
}, 30000);