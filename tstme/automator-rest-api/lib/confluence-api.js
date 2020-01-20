var ConfluenceApi = require("confluence-restapi");
var options;

class ConfluenceApi {
    constructor() {
        this.confluenceClientAuth = Confluence.create(
            options = {
                user: process.env.USER_EMAIL,
                password: process.env.JIRA_API_TOKEN,
                baseUrl: "https://" + process.env.ATLASSIAN_SITENAME + ".atlassian.net/wiki/rest/api"
            });
    }
    /**
     * Creates confluence space.
     *
     * @method createConSpace
     * @param projName - Project name.
     * @param projKey - Project key.  
     * @return Space Id
     */
    async createConSpace(projName, projKey) {
        return new Promise(async (resolve, reject) => {
            await this.confluenceClientAuth.space.createSpace({
                name: projName,
                key: projKey,
                description: {
                    plain: {
                        value: "",
                        representation: " "
                    }
                }
            }, function (err, data) {
                if (err) {
                    console.log("[CONFLUENCE]Error while creating Confluence Space", err);
                    return reject(err);
                } else {
                    console.log("[CONFLUENCE]Confluence Space created", data.id);
                    return resolve(data.id);
                }
            });
        });
    }
}

module.exports = ConfluenceApi