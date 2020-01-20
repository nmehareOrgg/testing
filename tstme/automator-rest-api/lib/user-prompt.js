const inquirer = require("inquirer");
const GitHubApi = require("./github-api"); //Github

async function getProjectConfig() {
    var gitHubApi = new GitHubApi();
    const orgNames = await gitHubApi.getOrgList();
    return inquirer.prompt([
        projectNamePrompt(),
        projectOrgPrompt(orgNames),
        repoPrompt(),
        projectKeyPrompt(),
        repoPrivacyPrompt(),
        projectTeamPrompt(),
        projectRolePrompt(),
        projectTeamMembersPrompt()
    ]);
}

function projectNamePrompt() {
    return {
        message: "Enter a project name:",
        name: "projectName",
        type: "input",
        validate: value => value.length > 0 || "Please enter a project name:"
    }
}

function repoPrompt() {
    return {
        message: "[GitHub] Enter the name of the repository you would like to create(or leave empty to use project name):",
        name: "gitHubRepos",
        type: "input"
    }
}

function projectTeamPrompt() {
    return {
        filter: value => value.split(" ").filter(Boolean),
        message: "[GitHub] Enter the user name of the team members for the project (separated by a space):",
        name: "userName",
        type: "input",
        validate: value => value.length > 0 || "Enter the user name of the team members for the project (separated by a space):"
    }
}

function projectOrgPrompt(orgNames) {
    if (orgNames.length > 0) {
        return {
            message: "[GitHub] Select an organization name:",
            name: "projectOrg",
            type: "list",
            choices: orgNames
        }
    } else {
        return {
            message: "[GitHub] Enter an organization name:",
            name: "projectOrg",
            type: "input",
            validate: value => value.length > 0 || "Enter an organization name:"
        }
    }
}

function repoPrivacyPrompt() {
    return {
        message: "[GitHub] Make repos private?:",
        name: "gitHubReposPrivacy",
        type: "confirm"
    }
}

function projectKeyPrompt() {
    return {
        message: "[JIRA] Enter a project key(followed by one or more alphanumeric characters):",
        name: "projectKey",
        type: "input",
        maxLength: 10,
        validate: projectKeyValidation
    }
}

const projectKeyValidation = async (value) => {
    var filter = /^[a-zA-Z][a-zA-Z0-9]*$/;
    if (value.length > 0 && value.length < 11) {
        if (!filter.test(value)) {
            return "Project keys must start with an letter, followed by one or more alphanumeric characters.";
        } else {
            return true;
        }
    } else {
        return "Please enter a project key maximum 10 characters long:";
    }
};

function projectTeamMembersPrompt() {
    return {
        filter: value => value.split(" ").filter(Boolean),
        message: "[JIRA|CONFLUENCE] Enter the emails of the team members for the project (separated by a space)(or leave empty to use user name):",
        name: "projectTeam",
        type: "input",
        //validate: value => value.length > 0 || "Enter the emails of the team members for the project (separated by a space):"
    }
}

function projectRolePrompt() {
    return {
        message: "[JIRA] Select a project role to add team members:",
        name: "projectRole",
        type: "list",
        choices: ['Administrator', 'Viewer', 'Member'],
    }
}

module.exports = {
    getProjectConfig
}