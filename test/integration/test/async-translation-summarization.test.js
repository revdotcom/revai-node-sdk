const fs = require('fs');
const clientHelper = require('../src/client-helper');
const { SummarizationJobStatus } = require('../../../dist/src/models/async/SummarizationJobStatus');
const { TranslationJobStatus } = require('../../../dist/src/models/async/TranslationJobStatus');
const { JobStatus } = require('../../../dist/src/models/JobStatus');
const { NlpModel } = require('../../../dist/src/models/NlpModel');

test('async translation/summarization submit local file', async () => {
    const client = clientHelper.getAsyncClient();
    const options = new Object();
    options.metadata = 'Node sdk async translation/summarization submit local file';
    options.delete_after_seconds = 50000;
    options.language = "en";

    options.summarization_config = {
        type:'bullets',
        model:'premium',
        prompt: "Try to summarize this transcript as good as you possibly can"
    };

    options.translation_config = {
        target_languages : [
        {
            language:'es',
            model:'premium'
        },
        {
            language:'ru'
        }
    ]};
   
    var job = await client.submitJobLocalFile('./test/integration/resources/test_mp3.mp3', options);

    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();

    expect(job.summarization).not.toBeNull();
    expect(job.summarization.model).toBe('premium');
    expect(job.summarization.type).toBe('bullets');
    expect(job.summarization.prompt).toBe("Try to summarize this transcript as good as you possibly can");

    expect(job.translation).not.toBeNull();
    expect(job.translation.target_languages).not.toBeNull();
    expect(job.translation.target_languages.length).toBe(2);
   
    while(job != null && (
        job.summarization.status === SummarizationJobStatus.InProgress ||
        job.translation.target_languages[0].status === TranslationJobStatus.InProgress ||
        job.translation.target_languages[1].status === TranslationJobStatus.InProgress
        )
    )
    {
      await new Promise(r => setTimeout(r, 5000));
      job = await client.getJobDetails(job.id);
    }
    expect(job.status).toBe(JobStatus.Transcribed);
    expect(job.summarization.status).toBe(SummarizationJobStatus.Completed);

    expect(job.translation.completed_on).not.toBeNull();
    expect(job.translation.target_languages[0].status).toBe(TranslationJobStatus.Completed);
    expect(job.translation.target_languages[0].language).toBe("es");
    expect(job.translation.target_languages[0].model).toBe(NlpModel.PREMIUM);

    expect(job.translation.target_languages[1].status).toBe(TranslationJobStatus.Completed);
    expect(job.translation.target_languages[1].language).toBe("ru");

    var summary = await client.getTranscriptSummaryText(job.id);
    expect(summary).not.toBeNull();

    var summaryObject = await client.getTranscriptSummaryObject(job.id);
    expect(summaryObject).not.toBeNull();
    expect(summaryObject.bullet_points.length).toBeGreaterThan(0);
    
    var translationString1 = client.getTranslatedTranscriptText(job.id,"es");
    expect(translationString1).not.toBeNull();
    var translationObject1 = client.getTranslatedTranscriptObject(job.id,"es");
    expect(translationObject1).not.toBeNull();
    var translationObject1Stream = client.getTranslatedTranscriptObjectStream(job.id,"es");
    expect(translationObject1Stream).not.toBeNull();
    var translatedCaptionsStream1 = client.getTranslatedCaptions(job.id,"es", undefined, 0);
    expect(translatedCaptionsStream1).not.toBeNull();

    var translationString2 = client.getTranslatedTranscriptText(job.id,"ru");
    expect(translationString2).not.toBeNull();
    var translationObject2 = client.getTranslatedTranscriptObject(job.id,"ru");
    expect(translationObject2).not.toBeNull();
    var translationObject2Stream = client.getTranslatedTranscriptObjectStream(job.id,"ru");
    expect(translationObject2Stream).not.toBeNull();
    var translatedCaptionsStream2 = client.getTranslatedCaptions(job.id,"ru", undefined, 0);
    expect(translatedCaptionsStream2).not.toBeNull();

}, 180000);

test('async translation/summarization submit url', async () => {
    const client = clientHelper.getAsyncClient();
    const options = new Object();
    options.metadata = 'Node sdk async translation/summarization submit local file';
    options.delete_after_seconds = 50000;
    options.language = "en";

    options.summarization_config = {
        type:'bullets',
        model:'premium',
        prompt: "Try to summarize this transcript as good as you possibly can"
    };

    options.translation_config = {
        target_languages : [
        {
            language:'es',
            model:'premium'
        },
        {
            language:'ru'
        }
    ]};
   
    var job = await client.submitJobUrl('https://www.rev.ai/FTC_Sample_1.mp3', options);

    expect(job.status).toBe('in_progress');
    expect(job.id).not.toBeNull();

    expect(job.summarization).not.toBeNull();
    expect(job.summarization.model).toBe('premium');
    expect(job.summarization.type).toBe('bullets');
    expect(job.summarization.prompt).toBe("Try to summarize this transcript as good as you possibly can");

    expect(job.translation).not.toBeNull();
    expect(job.translation.target_languages).not.toBeNull();
    expect(job.translation.target_languages.length).toBe(2);
   
    while(job != null && (
        job.summarization.status === SummarizationJobStatus.InProgress ||
        job.translation.target_languages[0].status === TranslationJobStatus.InProgress ||
        job.translation.target_languages[1].status === TranslationJobStatus.InProgress
        )
    )
    {
      await new Promise(r => setTimeout(r, 5000));
      job = await client.getJobDetails(job.id);
    }
    expect(job.status).toBe(JobStatus.Transcribed);
    expect(job.summarization.status).toBe(SummarizationJobStatus.Completed);

    expect(job.translation.completed_on).not.toBeNull();
    expect(job.translation.target_languages[0].status).toBe(TranslationJobStatus.Completed);
    expect(job.translation.target_languages[0].language).toBe("es");
    expect(job.translation.target_languages[0].model).toBe(NlpModel.PREMIUM);

    expect(job.translation.target_languages[1].status).toBe(TranslationJobStatus.Completed);
    expect(job.translation.target_languages[1].language).toBe("ru");

    var summary = await client.getTranscriptSummaryText(job.id);
    expect(summary).not.toBeNull();

    var summaryObject = await client.getTranscriptSummaryObject(job.id);
    expect(summaryObject).not.toBeNull();
    expect(summaryObject.bullet_points.length).toBeGreaterThan(0);
    
    var translationString1 = client.getTranslatedTranscriptText(job.id,"es");
    expect(translationString1).not.toBeNull();
    var translationObject1 = client.getTranslatedTranscriptObject(job.id,"es");
    expect(translationObject1).not.toBeNull();
    var translationObject1Stream = client.getTranslatedTranscriptObjectStream(job.id,"es");
    expect(translationObject1Stream).not.toBeNull();
    var translatedCaptionsStream1 = client.getTranslatedCaptions(job.id,"es", undefined, 0);
    expect(translatedCaptionsStream1).not.toBeNull();

    var translationString2 = client.getTranslatedTranscriptText(job.id,"ru");
    expect(translationString2).not.toBeNull();
    var translationObject2 = client.getTranslatedTranscriptObject(job.id,"ru");
    expect(translationObject2).not.toBeNull();
    var translationObject2Stream = client.getTranslatedTranscriptObjectStream(job.id,"ru");
    expect(translationObject2Stream).not.toBeNull();
    var translatedCaptionsStream2 = client.getTranslatedCaptions(job.id,"ru", undefined, 0);
    expect(translatedCaptionsStream2).not.toBeNull();

}, 180000);
