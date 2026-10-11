
pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    if (isUnix()) {
                        sh '''
                            set -e
                            node --version
                            npm --version

                            if [ -f package-lock.json ]; then
                                npm ci
                            else
                                echo "package-lock.json not found; using npm install"
                                npm install
                            fi
                        '''
                    } else {
                        bat '''
                            @echo off
                            node --version
                            if errorlevel 1 exit /b 1

                            npm --version
                            if errorlevel 1 exit /b 1

                            if exist package-lock.json (
                                call npm ci
                            ) else (
                                echo package-lock.json not found; using npm install
                                call npm install
                            )

                            if errorlevel 1 exit /b 1
                        '''
                    }
                }
            }
        }

        stage('Cypress Tests') {
            steps {
                catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                    script {
                        if (isUnix()) {
                            sh 'npm run cypress:run -- --config video=true'
                        } else {
                            bat 'call npm run cypress:run -- --config video=true'
                        }
                    }
                }
            }
        }

        stage('Publish Results') {
            steps {
                echo 'Archiving Cypress test artifacts...'

                archiveArtifacts(
                    artifacts: 'cypress/reports/**/*,cypress/screenshots/**/*,cypress/videos/**/*,allure-results/**/*',
                    allowEmptyArchive: true
                )

                script {
                    def allureResultsExist = false

                    if (isUnix()) {
                        int checkResult = sh(
                            script: '''
                                if [ -d allure-results ] &&
                                   find allure-results -type f -name '*-result.json' -print -quit | grep -q .; then
                                    exit 0
                                else
                                    exit 1
                                fi
                            ''',
                            returnStatus: true
                        )

                        allureResultsExist = (checkResult == 0)
                    } else {
                        int checkResult = bat(
                            script: '''
                                @echo off
                                if not exist "allure-results" exit /b 1

                                for /r "allure-results" %%F in (*-result.json) do (
                                    if exist "%%F" exit /b 0
                                )

                                exit /b 1
                            ''',
                            returnStatus: true
                        )

                        allureResultsExist = (checkResult == 0)
                    }

                    if (allureResultsExist) {
                        echo 'Allure test result files found.'

                        catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                            allure(
                                includeProperties: false,
                                jdk: '',
                                results: [[path: 'allure-results']]
                            )
                        }
                    } else {
                        echo 'No Allure *-result.json files found. Skipping Allure publication.'
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Final Jenkins build result: ${currentBuild.currentResult}"
            echo 'Cypress pipeline completed. Check archived artifacts and console logs.'
        }

        success {
            echo 'Cypress test run succeeded.'
        }

        failure {
            echo 'Cypress pipeline failed. Review the Cypress output and archived artifacts.'
        }
    }
}
