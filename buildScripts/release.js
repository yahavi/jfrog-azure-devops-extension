const fs = require('fs');
const path = require('path');
const assert = require('assert');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const editJsonFile = require('edit-json-file');
const simpleGit = require('simple-git');
const compareVersions = require('compare-versions');
const editJsonFileOptions = {autosave: true, stringify_width: 4};
const githubRepo = 'github.com/yahavi/artifactory-vsts-extension.git';

const optionDefinitions = [
    {name: 'help', alias: 'h', type: Boolean, description: 'Display this usage guide.'},
    {name: 'version', alias: 'v', type: String, description: 'Version to set. Format: X.X.X'},
    {name: 'github-username', type: String, description: 'Github username', defaultValue: process.env.VSTS_GITHUB_USERNAME},
    {name: 'github-password', type: String, description: 'Github password', defaultValue: process.env.VSTS_GITHUB_PASSWORD},
    {name: 'commit-changes', type: Boolean, description: 'Set to true if you want to commit the changes and create a new tag', defaultValue: false}
];

const commandLineArgsOptions = commandLineArgs(optionDefinitions, {camelCase: true});
if (commandLineArgsOptions.help ||
    !(commandLineArgsOptions.version && commandLineArgsOptions.githubUsername && commandLineArgsOptions.githubPassword)) {
    const usage = commandLineUsage([
        {
            header: 'Release Artifactory VSTS extension',
            content: 'A simple tool to release JFrog Artifactory VSTS extension.'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        }
    ]);
    console.log(usage);
    process.exit(commandLineArgsOptions.help ? 0 : 1);
}
let splitVersion = commandLineArgsOptions.version.split('.');

assertVersion();
updateTasks();
updateVssExtension();
commitAndPush();
console.log("Succeed");

function assertVersion() {
    assert.equal(splitVersion.length, 3, 'Version must be of format X.X.X');
    let vssExtension = fs.readFileSync('vss-extension.json', 'utf8');
    let vssExtensionJson = JSON.parse(vssExtension);
    assert.equal(compareVersions(commandLineArgsOptions.version, vssExtensionJson.version), 1, 'Input version must be bigger than current version');
}

function updateTasks() {
    let files = fs.readdirSync(path.join('tasks'));
    files.forEach(taskName => {
        console.log("Updating " + taskName);
        let taskDir = path.join('tasks', taskName);
        let taskJsonPath = path.join(taskDir, "task.json");
        let taskJson = editJsonFile(taskJsonPath, editJsonFileOptions);
        taskJson.set('version', {
            "Major": splitVersion[0],
            "Minor": splitVersion[1],
            "Patch": splitVersion[2]
        });
        simpleGit().add(taskJsonPath);
    });
}

function updateVssExtension() {
    console.log("Updating vss-extension.json");
    let vssExtensionJson = editJsonFile('vss-extension.json', editJsonFileOptions);
    vssExtensionJson.set('version', commandLineArgsOptions.version);
    simpleGit().add('vss-extension.json');
}

function commitAndPush() {
    if (commandLineArgsOptions.commitChanges) {
        console.log("Creating tag and pushing to Github");
        simpleGit()
            .outputHandler((command, stdout, stderr) => {
                stdout.pipe(process.stdout);
                stderr.pipe(process.stderr);
            })
            .commit('Bumped version to ' + commandLineArgsOptions.version)
            .tag([commandLineArgsOptions.version])
            .push(['https://' + commandLineArgsOptions.githubUsername + ':' + commandLineArgsOptions.githubPassword + '@' + githubRepo, 'tests-branch', '--tags']);
    }
}
