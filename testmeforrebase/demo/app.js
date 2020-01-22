const { WebClient } = require('@slack/web-api');

// An access token (from your Slack app or custom integration - xoxp, xoxb)
const token = "xoxp-885896185043-887139916225-897437338149-b6c3c7001039a9ae4a2029d6eb8e7e21";

const web = new WebClient(token);

// This argument can be a channel ID, a DM ID, a MPDM ID, or a group ID
const conversationId = 'testnam';

(async () => {
  // See: https://api.slack.com/methods/chat.postMessage
  const res = await web.chat.postMessage({ channel: conversationId, text: 'Hello there' });
  const res1 = await web.conversations.create({
    name: "test1112211"
});

  // `res` contains information about the posted message
  console.log('Message sent: ', res.ts);
  console.log('Message sent: ', res1);
})();