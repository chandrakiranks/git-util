#!/usr/bin/env node

// Using export varaibles
var GIT_REPO = process.env.GIT_REPO;
var RELEASE_BRANCH = process.env.RELEASE_BRANCH;

// Accepting arguments from command line
const yargs = require("yargs");
const fetch = require('node-fetch');
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

const options = yargs
    .usage("Usage: --prerelease --getlatestcode")
    .option("prerelease", { alias: "prerelease", describe: "is it pre release?", type: "boolean", demandOption: false })
    .option("getlatestrelease", { alias: "getlatestrelease", describe: "is it release?", type: "boolean", demandOption: false })
    .option("tag", { alias: "tag", describe: "version number of new release", type: "string", demandOption: false })
    .option("tagFor", { alias: "tagFor", describe: "creating the tag for which platform?", type: "string", demandOption: false })
    .argv;

function resolved(result) {
    console.log('Resolved');
}

function rejected(result) {
    console.error(result);
}

function getLatestRelease() {
    getReleases().then((data) =>{
        console.log(data[0]['tag_name']);
    })
}

function getReleases() {
    var releasesURL = GIT_REPO+"/releases";
    return fetch(releasesURL)
        .then(res => res.json())
        .then(data => {
            if (data && data.length && data.length > 0) {
                return Promise.resolve(data);
            } else {
                Promise.reject(new Error('API - Check the API URL')).then(resolved, rejected);
            }
        })
        .catch(err => { console.error(err) });
}

function getComits(branch) {
    if (branch) {
        //console.log('Getting commits from ' + branch);
        var branchCommitsURL = GIT_REPO+"/commits?sha=" + branch;
        return fetch(branchCommitsURL)
            .then(res => res.json())
            .then(data => {
                if (data && data.length && data.length > 0) {
                    return Promise.resolve(data);
                } else {
                    Promise.reject(new Error('API - Check the API URL, Branch Name')).then(resolved, rejected);
                }
            })
            .catch(err => { console.error(err) });
    } else {
        return false;
    }
}

function calculateNewTagVersion(curVersion) {
    if(options.tag && options.tag !== "") {
        return options.tag;
    } else {
        //console.log('Calculating next release tag version');
        var curVersion = curVersion.split('.');
        curVersion[2]++;
        var newVersion = curVersion.join('.');
        //console.log('New Pre Release Tag version is ' + newVersion);
        return newVersion;
    }
}

function getLatestPublishedRelease() {
    var latestReleaseURL = GIT_REPO + "/releases/latest";
    return fetch(latestReleaseURL)
        .then(res => res.json())
        .then(data => {
            if (data && data.tag_name) {
                return Promise.resolve(data.tag_name);
            } else {
                Promise.reject(new Error('API - Check the API URL')).then(resolved, rejected);
            }
        })
        .catch(err => { console.error(err) });
}

function createPreReleaseTag(releaseBranch, newTagVersion) {
    //console.log('Proceeding to create new Pre Release Tag ... ' + newTagVersion);

    if (releaseBranch) {

        getLatestPublishedRelease()
            .then((data) => {
                var lastPublishedTag = data;

                //console.log('Getting change log between ' + releaseBranch + ' and  ' + lastPublishedTag);
                var changeLogURL = GIT_REPO + "/compare/" + lastPublishedTag + '...' + releaseBranch;
                // var changeLogURL = GIT_REPO + "/compare/" + releaseBranch + '...' + lastPublishedTag;
                //console.log(changeLogURL);

                return fetch(changeLogURL, { headers: { 'Accept': 'application/vnd.github.VERSION.raw+json'} })
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.commits && data.commits.length && data.commits.length > 0) {

                            // extracting necessary data from commits
                            var changeLog = [];
                            data.commits.map((commit) => {
                                author = commit.commit && commit.commit.author && commit.commit.author.name ? commit.commit.author.name : (commit.commit.author && commit.commit.author.login ? commit.commit.author.login : '-');
                                message = commit.commit.message.split('\n');
                                var commitDate = commit.commit.author.date;
                                commitDate = new Date(commitDate);
                                commitDate = commitDate.toString().replace('GMT+0530 (India Standard Time)', '');
                                changeLog.push(commit.sha.substring(0, 10) + ' | ' + commitDate + ' | ' + author + ' | ' + message[0]);
                            });
                            changeLog = changeLog.reverse();

                            // constructing string
                            changeLog = changeLog.join('<br />');
                            changeLog = changeLog.replace('"', '');
                            changeLog = changeLog.replace('\'', '');

                            var tagFor = options.tagFor ? " for " + options.tagFor : "";
                            var tagTitle = "Release Tag from " + RELEASE_BRANCH + tagFor + " - " + newTagVersion;

                            // creating payload
                            var payload = {
                                "tag_name": newTagVersion,
                                "target_commitish": RELEASE_BRANCH,
                                "name": tagTitle,
                                "body": changeLog,
                                "draft": false,
                                "prerelease": true
                            };

                            var createReleaseURL = GIT_REPO + "/releases";
                            return fetch(createReleaseURL, {method: 'POST', body: JSON.stringify(payload)})
                                .then(res => res.json())
                                .then((data) => {
                                    //console.log(data);
                                    //console.log('---- Created the new release tag - ' + newTagVersion + ' ----');
                                    return Promise.resolve(data);
                                });

                        } else {
                            Promise.reject(new Error('API - May be there are no new commits, Please check your Branch Name and Tag Name and commit history.')).then(resolved, rejected);
                        }
                    })
                    .catch(err => { console.error(err) });

            });

    }



}

function prerelease() {
    // get releases
    // if the latest release is not a pre-release (pre-release == false), create a new pre-release
    // if the latest release is pre-release (pre-release == true), check for commit in pre-release and release branch
    //  if commits are same, no need to create new pre-release
    //  else, create new release

    getReleases().then((releases) => {
        // get releases
        if ( releases && releases.length && releases.length > 0 )
        {
            var latestReleaseTag = releases[0].tag_name;

            // if the latest release is not a pre-release (pre-release == false), create a new pre-release
            if (releases[0].prerelease == false) {
                // create new release tag
                var newPreReleaseTag = calculateNewTagVersion(latestReleaseTag);
                createPreReleaseTag(RELEASE_BRANCH, newPreReleaseTag);

            } else if (releases[0].prerelease == true) {
                //console.log("There is a Pre Release Tag - " + latestReleaseTag);
                //console.log('Checking for commits in pre-release (' + latestReleaseTag + ') and release branch (' + RELEASE_BRANCH + ')');

                getComits(RELEASE_BRANCH).then((releaseBranchCommits) => {
                    var lastCommitInReleaseBranch = releaseBranchCommits[0].sha;
                    //console.log('Latest Commit in Release branch - ' + RELEASE_BRANCH + ' - ' + lastCommitInReleaseBranch)
                    getComits(latestReleaseTag).then((preReleaseTagCommits) => {
                        var lastCommitInReleaseTag = preReleaseTagCommits[0].sha;
                        //console.log('Latest Commit in Release tag - ' + latestReleaseTag + ' - ' + lastCommitInReleaseTag);

                        // if commits are same, no need to create new pre-release
                        //console.log(lastCommitInReleaseBranch + " == " + lastCommitInReleaseTag);
                        if ( lastCommitInReleaseBranch == lastCommitInReleaseTag ) {
                            //console.log('There are no new commits Release branch when compared to latest pre release tag, so no need to create new pre release tag');
                            console.log(latestReleaseTag);
                        } else {
                            // create new release tag
                            var newPreReleaseTag = calculateNewTagVersion(latestReleaseTag);
                            createPreReleaseTag(RELEASE_BRANCH, newPreReleaseTag);
                        }
                    });
                });
            }
        }
    });
}

if ( options.prerelease == true ) {
    if (GIT_REPO && RELEASE_BRANCH) {
        prerelease();
    } else {
        console.log('>>> Please set the GIT_REPO and RELEASE_BRANCH <<<');
        process.exit(1);
    }
}

if ( options.getlatestrelease == true ) {
    if (GIT_REPO) {
        getLatestRelease();
    } else {
        console.log('>>> Please set the GIT_REPO <<<');
        process.exit(1);
    }
}

