#!/usr/bin/env node

const request = require('request-promise');
const JiraApi = require('./lib/jira-api'); //jira
const GitHubApi = require("./lib/github-api"); //Github
const ConfluenceApi = require("./lib/confluence-api"); //Confluence
const SlackApi = require("./lib/slack-api"); //Slack
const userPrompt = require("./lib/user-prompt") //user input
require('dotenv').config();

var confluenceApi = new ConfluenceApi();
var jiraApi = new JiraApi();
var gitHubApi = new GitHubApi();
var slackApi = new SlackApi();

userPrompt.getProjectConfig().then(projectInfo => {
    createProject(projectInfo);
}).catch(error => {
    console.log("Something went wrong!", error);
    process.exit(1);
});

/**
 * Create projects for Jira, Github and Confluence.
 *
 * @method createProject
 * @param config - User input
 */
async function createProject(config) {
    console.log("-------------CREATING PROJECTS MAY TAKE SOMETIME-------------");
    if (typeof config.projectTeam !== 'undefined' && config.projectTeam.length > 0) {
        config.userName = config.projectTeam;
    }
    try {
        await Promise.all([//createJiraProject(config),
               // createGithubRepo(config),
               // createConfluenceSpace(config)
               createSlackChannel(config)
            ])
            .then(data => console.log("---------------------FINISHED EXECUTION--------------------"))
            .catch(e => console.log('Creation of projects failed: ', e));
    } catch (e) {
        console.error(e);
        //process.exit(1);
    }
}

/**
 * Creates a Github repository, team and add team members.
 *
 * @method createGithubRepo
 * @param config - User input.
 */
async function createGithubRepo(config) {
    const githhubRepoId = await gitHubApi.createRepo(config.gitHubRepos || config.projectName, config.projectOrg, config.gitHubReposPrivacy);
    if (typeof githhubRepoId !== 'undefined' && githhubRepoId) {
        await gitHubApi.createTeamAddMember(config.gitHubRepos || config.projectName, config.projectOrg, config.userName);
    }
}

/**
 * Handles all Jira related things including creation of Jira project and team.
 *
 * @method createJiraProject
 * @param config - User input.
 */
async function createJiraProject(config) {
    const jiraProjId = await jiraApi.createJiraProj(config.projectName, config.projectKey.toUpperCase());
    if (typeof jiraProjId !== 'undefined' && jiraProjId) {
        let [jiraProjRoleId, users, groupName] = await Promise.all([
            jiraApi.getProjRoles(jiraProjId, config.projectRole),
            jiraApi.searchUser(config.userName),
            jiraApi.createGroup(config.projectName)
        ]);
        if ((jiraProjRoleId && typeof jiraProjRoleId !== 'undefined') && (users && users.size > 0)) {
            const userAccountIds = [...users.keys()];
            const userNames = [...users.values()];
            await jiraApi.addTeamMembers(userAccountIds, jiraProjRoleId, jiraProjId);
            if (groupName && typeof groupName !== 'undefined') {
                await jiraApi.addUsersToGroup(userNames, groupName.name);
            }
        }
    }
}

/**
 * Creates confluence space
 *
 * @method createConfluenceSpace
 * @param config - User input.
 */
async function createConfluenceSpace(config) {
    await confluenceApi.createConSpace(config.projectName, config.projectKey.toUpperCase());
}

async function createSlackChannel(config) {
    await slackApi.createChannel(config.projectName);
    await slackApi.lookForUserSlackId(config.projectTeam,config.userName,config.projectName);
}