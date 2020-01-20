const JiraClient = require("jira-connector");
var options;

class JiraApi {
    constructor() {
        this.jiraClientAuth = new JiraClient(
            options = {
                host: process.env.ATLASSIAN_SITENAME + ".atlassian.net",
                basic_auth: {
                    email: process.env.USER_EMAIL,
                    api_token: process.env.JIRA_API_TOKEN
                }
            });
    }

    /**
     * Creates a Jira project.
     *
     * @method createJiraProj
     * @param projName - Project name.
     * @param projKey - Project key.
     * @return Jira project id.
     */
    async createJiraProj(projName, projKey) {
        return await this.jiraClientAuth.project.createProject({
                description: "",
                url: "http://atlassian.com",
                name: projName,
                projectTypeKey: "software",
                projectTemplateKey: "com.pyxis.greenhopper.jira:gh-simplified-agility-scrum", //template for next-gen project
                key: projKey,
                lead: "admin",
                assigneeType: "UNASSIGNED"
                //categoryId: 10203
            }).then(data => {
                console.log("[JIRA]Jira project created");
                return data.id;
            })
            .catch(e => console.log('[JIRA]Project named ' + projName + ' already exists-- ', e.message));
    }

    /**
     * Get project roles.
     *
     * @method getProjRoles
     * @param projectId - Project id.
     * @param projectRole - Project role.
     * @return project roles.
     */
    async getProjRoles(projectId, projectRole) {
        var projRoleId = 0;
        await this.jiraClientAuth.project.getRoles({
            projectIdOrKey: projectId
        }).then(data => {
            var projRole = data[projectRole];
            var url = projRole.split('/');
            projRoleId = url[url.length - 1];

        }).catch(e => console.log('[JIRA]No project roles defined-- ', e.message));
        return projRoleId;
    }

    /**
     * Add team members for specified role to team.
     *
     * @method addTeamMembers
     * @param useraccountIds - Array of account ids of user.
     * @param projectRoleId - Project role id.
     * @param projectId - Project id.
     */
    async addTeamMembers(useraccountIds, projectRoleId, projectId) {
        if (typeof useraccountIds !== 'undefined' && useraccountIds.length > 0) {
            await this.jiraClientAuth.project.addToRole({
                projectIdOrKey: projectId,
                roleId: projectRoleId,
                newRole: {
                    "user": useraccountIds
                }
            }).then(data => {
                console.log("[JIRA]Team Members added to Jira Project");
            }).catch(e => console.log('[JIRA]User is already a member of project role-- ', e.message));
        }
    }

    /**
     * Search for the users.
     *
     * @method addTeamMembers
     * @param projectTeam - User names/email addresses for the user.
     * @return usersMap - Map with user account id as key and user name as value.
     */
    async searchUser(projectTeam) {
        var users = [];
        var usersMap = new Map();
        return await Promise.all(projectTeam.map(async (user) => {
            await this.jiraClientAuth.user.search({
                query: user
            }).then(data => {
                usersMap.set(data[0].accountId, data[0].name);
                users.push(data[0].accountId);
            }).catch(e => {
                console.log('[ATLASSIAN]Username/Email ' + user + ' Invalid--', e.message);
            });
        })).then(async () => {
            return usersMap;
        }).catch(e => {
            console.log('[ATLASSIAN]Username/Email Not Found--', e.message);
        });
    }

    /**
     * Create atlassian group
     *
     * @method createGroup
     * @param groupName - Group name.
     */
    async createGroup(groupName) {
        return await this.jiraClientAuth.group.createGroup({
            group: {
                name: groupName,
                description: " "
            }
        }).catch(e => console.log('[CONFLUENCE]Failed to create Group-- ', e.message));
    }

    /**
     * Add users to the group
     *
     * @method addUsersToGroup
     * @param userNames - Array of user names to be added.
     * @param groupName - Group name.
     */
    async addUsersToGroup(userNames, groupName) {
        if (typeof userNames !== 'undefined' && userNames.length > 0) {
            return await Promise.all(userNames.map(async (userName) => {
                const contents = await this.jiraClientAuth.group.addUserToGroup({
                    groupName: groupName,
                    userName: userName
                }).then(data => {
                    console.log("[JIRA]User " + userName + " added to a group " + groupName);
                }).catch(e => {
                    console.log('[JIRA]User named "', userName + '" not added to team. Username/Email Invalid--', e.message);
                });
            }));
        }
    }
}

module.exports = JiraApi