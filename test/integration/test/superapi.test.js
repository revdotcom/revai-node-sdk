const fs = require('fs');
const clientHelper = require('../src/client-helper');
const { SummarizationJobStatus } = require('../../../dist/src/models/async/SummarizationJobStatus');
const { JobStatus } = require('../../../dist/src/models/JobStatus');

test('superapi Can submit local file', async () => {
    const client = clientHelper.getAsyncClient();
    const options = new Object();
    options.metadata = 'Node sdk superapi submit local file';
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
        job.summarization.status == SummarizationJobStatus.InProgress
        /*job.translation.target_languages[0].status == TranslationJobStatus.IN_PROGRESS ||
        job.translation.target_languages[1].status == TranslationJobStatus.IN_PROGRESS*/
        )
    )
    {
        console.info("Check " + job.id+' '+job.summarization.status);
      await new Promise(r => setTimeout(r, 5000));
      job = await client.getJobDetails(job.id);
    }
    console.info("Done " + job.summarization.status);
    expect(job.status).toBe(JobStatus.Transcribed);
    expect(job.summarization.status).toBe(SummarizationJobStatus.Completed);

    //assertThat(revAiJob.getTranslation().getCompletedOn()).isNotNull();
    //assertThat(revAiJob.getTranslation().getTargetLanguages().get(0).getJobStatus()).isEqualTo(TranslationJobStatus.COMPLETED);
    //assertThat(revAiJob.getTranslation().getTargetLanguages().get(0).getLanguage()).isEqualTo("es");
    //assertThat(revAiJob.getTranslation().getTargetLanguages().get(0).getModel()).isEqualTo(NlpModel.PREMIUM);

    //assertThat(revAiJob.getTranslation().getTargetLanguages().get(1).getJobStatus()).isEqualTo(TranslationJobStatus.COMPLETED);

    var summary = await client.getTranscriptSummaryText(job.id);
    expect(summary).not.toBeNull();

    var summaryObject = await client.getTranscriptSummaryObject(job.id);
    expect(summaryObject).not.toBeNull();
    expect(summaryObject.bullet_points.length).toBeGreaterThan(0);
    //var translationString1 = apiClient.getTranslatedTranscriptText(revAiJob.getJobId(),"es");
    //assertThat(translationString1).isNotNull();

    //var translationString2 = apiClient.getTranslatedTranscriptText(revAiJob.getJobId(),"ru");
    //assertThat(translationString2).isNotNull();


    //var translationObject1 = apiClient.getTranslatedTranscriptObject(revAiJob.getJobId(),"es");
    //assertThat(translationObject1).isNotNull();

    //var translationObject2 = apiClient.getTranslatedTranscriptObject(revAiJob.getJobId(),"ru");
    //assertThat(translationObject2).isNotNull();

    //var translatedCaptionsStream1 = apiClient.getTranslatedCaptions(revAiJob.getJobId(),"es",RevAiCaptionType.SRT,0);
    //assertThat(translatedCaptionsStream1).isNotNull();
    //var translatedCaptionsStream2 = apiClient.getTranslatedCaptions(revAiJob.getJobId(),"ru",RevAiCaptionType.SRT,0);
    //assertThat(translatedCaptionsStream2).isNotNull();*/

}, 300000);
