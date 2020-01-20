const Octokit = require("@octokit/rest"); //Github
const {
    request
} = require("@octokit/request");

class GitHubApi {
    constructor() {
        this.githubClientAuth = new Octokit({
            auth: "token " + process.env.GITHUB_API_TOKEN
        })
    }

    /**
     * Creates a Github repository.
     *
     * @method createRepo
     * @param repoName - Repository name.
     * @param orgName - Organization name.  
     * @param privacy - If Yes create private repository else create public repository
     * @return Repository id.
     */
    async createRepo(repoName, orgName, privacy) {
        return await this.githubClientAuth.repos.createInOrg({
                autoInit: true,
                description: "",
                hasDownloads: true,
                hasIssues: true,
                hasWiki: true,
                homepage: "https://github.com",
                name: repoName,
                org: orgName,
                private: privacy
            }).then(result => {
                console.log("[GITHUB]Github repository created", result.data.id);
                return result.data.id;
            })
            .catch(e => console.log('[GITHUB]Repository named ' + repoName + ' already exists-- ', e.message));
    }

    /**
     * Creates team and add team members.
     *
     * @method createTeamAddMember
     * @param repoNames - Repository name.
     * @param orgName - Organization name.  
     * @param userName - Array of user names to be added.
     */
    async createTeamAddMember(repoNames, orgName, userName) {
        const teamId = await this.githubClientAuth.teams.create({
            description: "",
            name: repoNames + "(Developers)",
            org: orgName,
            repo_names: [orgName + "/" + repoNames]
        });

        await Promise.all(userName.map(async (user) => {
            await this.githubClientAuth.teams.addOrUpdateMembership({
                team_id: teamId.data.id,
                username: user
            }).then(data => {
                console.log('[GITHUB]User "' + user + '" added to team');
            }).catch(e => {
                console.log('[GITHUB]User named "' + user + '" not added to team. User Name Invalid-- ', e.message);
            });
        }));
    }

    /**
     * Get organizations list.
     *
     * @method getOrgList 
     * @return orgNames - all organizations for logged in user.
     */
    async getOrgList() {
        const orgLists = await this.githubClientAuth.orgs.listForAuthenticatedUser();
        var orgNames = orgLists.data.map(function (org) {
            return org.login
        });
        return orgNames;
    }
}

module.exports = GitHubApi