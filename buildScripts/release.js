const fs = require('fs');
const path = require('path');
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const editJsonFile = require('edit-json-file');
const editJsonFileOptions = {autosave: true, stringify_width: 4};

const optionDefinitions = [
    {name: 'help', alias: 'h', type: Boolean, description: 'Display this usage guide.'},
    {name: 'git-username', type: String, description: 'Github username'},
    {name: 'git-password', type: String, description: 'Github password'},
    {name: 'major', type: String, description: 'Extension major to set'},
    {name: 'minor', type: String, description: 'Extension minor to set'},
    {name: 'patch', type: String, description: 'Extension patch to set'}
];

const commandLineArgsOptions = commandLineArgs(optionDefinitions);
if (commandLineArgsOptions.help || !(commandLineArgsOptions.major && commandLineArgsOptions.minor && commandLineArgsOptions.patch)) {
    const usage = commandLineUsage([
        {
            header: 'Release Artifactory VSTS extension',
            content: 'A simple tool to release JFrog Artifactory VSTS extension.'
        },
        {
            header: 'Options',
            optionList: optionDefinitions
        },
        {
            content: 'Project home: {underline https://github.com/jfrog/artifactory-vsts-extension}'
        }
    ]);
    console.log(usage);
    process.exit(1);
} else {
    console.log(commandLineArgsOptions)
}
const version = commandLineArgsOptions.major + "." + commandLineArgsOptions.minor + "." + commandLineArgsOptions.patch;

updateTasks();
updateVssExtension();



function updateTasks() {
    fs.readdir(path.join('..', 'tasks'), (err, files) => {
        files.forEach(taskName => {
            let taskDir = path.join('..', 'tasks', taskName);
            let taskJsonPath = path.join(taskDir, "task.json");
            let taskJson = editJsonFile(taskJsonPath, editJsonFileOptions);
            taskJson.set('version', {
                "Major": commandLineArgsOptions.major,
                "Minor": commandLineArgsOptions.minor,
                "Patch": commandLineArgsOptions.patch
            });
            require('simple-git')().add(taskJsonPath);
        });
    });
}

function updateVssExtension() {
    let vssExtensionJsonPath = path.join('..', 'vss-extension.json');
    let vssExtensionJson = editJsonFile(vssExtensionJsonPath, editJsonFileOptions);
    vssExtensionJson.set('version', version);
    require('simple-git')().add(vssExtensionJsonPath);
}



require('simple-git')().commit('Bumped version to ' + version).push();