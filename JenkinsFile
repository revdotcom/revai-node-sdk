pipeline {
    agent {
        dockerfile {
            label 'linux'
        }
    }
    environment {
        GIT_CREDENTIALS = credentials("${GITHUB_CREDENTIALS}")
    }
    stages {
        stage('Build') {
            steps {
                sh  """
                    npm install
                    npm run build
                """
            }
        }
        stage('Lint/Test') {
            steps {
                sh """
                    npm run lint
                    node build_release_package_json.js
                    npm run unit-test
                    node build_release_package_json.js
                    npm run integration-test
                """
            }
        }

        stage('Version Check') {
            steps {
                 script {
                    def data = readJSON file:'package.json'
                    checkVersionAlreadyExists(data.version)
                }
            }
        }

        stage('Publish') {
            steps {
                sh """
                    npm set registry "https://registry.npmjs.org"
                    npm set //registry.npmjs.org/:_authToken ${NPM_TOKEN}
                    node build_release_package_json.js
                    node create_release_readme.js
                    npm publish ./dist
                """
            }
        }

        stage('Tag') {
            steps {
                script {
                    def data = readJSON file:'package.json'
                    tagRepo(data.version)
                }
            }
        }
    }
    post {
        success {
            notifyComplete('SUCCESS')
        }
        failure {
            notifyComplete('FAILURE')
        }
    }
}

// get the url to the curent repo without the preceding https
def getRepoUrl() {
    def httpsPrefix = '^(https://)?'

    def matchesHttpsPrefix = "${GIT_URL}" =~ httpsPrefix

    return matchesHttpsPrefix.replaceFirst('')
}

// tags the current repo with the specified tag
def tagRepo(version) {
    echo "tagging repo with ${version}"

    // deletes current tag locally, this will make sure if the tag is deleted from remote it would be set again
    sh """
        git tag -d ${version} || (exit 0)
    """
    // see if it's still on remote - needed to avoid overwriting the tag
    sh """
        git fetch https://${GIT_CREDENTIALS}@${getRepoUrl()} --tags
    """
    // try to tag
    sh """
        git tag ${version}
    """
    sh """
        git push https://${GIT_CREDENTIALS}@${getRepoUrl()} ${version}
    """
}

// removes the specified project from the projects variable if the specified tag exists in git
def checkVersionAlreadyExists(version) {
    echo "checking tag ${version}"

    if (sh(script: """
        git ls-remote https://${GIT_CREDENTIALS}@${getRepoUrl()} --tags origin ${version}""", returnStdout: true).trim() != "") {
        echo "${version} is already released, please increase the version number for build to publish"
    } else {
        echo "will publish ${version}"
    }
}

def notifyComplete(String buildStatus) {
    String SUCCESS = 'SUCCESS'
    String FAILURE = 'FAILURE'

    if (env.NOSLACK_NOTIFICATIONS == 'true')
    {
        echo "Slack notifications are disabled"
        return
    }

    // build status of null means successful
    buildStatus =  buildStatus ?: SUCCESS
    def prevBuildResult = currentBuild.getPreviousBuild()?.getResult()
    echo "notifyComplete with status ${buildStatus}, previous build was ${prevBuildResult}"

    // Slack channel ID CFPMB0BK4 refers to #revai-alerts-nonprod, does not change even if channel name changes
    if (buildStatus == FAILURE && prevBuildResult != FAILURE)
        slackSend (
            color: '#FF0000', // red
            channel: 'CFPMB0BK4',
            message: "${env.JOB_NAME} ${env.BUILD_NUMBER} failed after ${currentBuild.durationString} (<${env.BUILD_URL}|Open>)")
    else if (buildStatus == SUCCESS && prevBuildResult != SUCCESS)
        slackSend (
            color: '#00FF00', // green
            channel: 'CFPMB0BK4',
            message: "${env.JOB_NAME} ${env.BUILD_NUMBER} back to normal after ${currentBuild.durationString} (<${env.BUILD_URL}|Open>)")
}
