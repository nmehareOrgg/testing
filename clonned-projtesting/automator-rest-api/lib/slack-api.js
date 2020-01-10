const { WebClient } = require('@slack/web-api');

class SlackApi {
    constructor() {
        this.slackClientAuth = new WebClient(process.env.SLACK_TOKEN);
    }
    /**
     * Creates Channel.
     *
     * @method createChannel
     * @param channelName - Channel name.
     * @return Channel Id
     */
    async createChannel(channelName) {
        return await this.slackClientAuth.conversations.create({
            name: channelName
        }).then(result => {
            console.log("[SLACK]Channel created", result);
            return result.channel.id;
        }).catch(e => console.log('[SLACK]Channel name ' + channelName + ' already exists-- ', e.message));
    }
}

module.exports = SlackApi