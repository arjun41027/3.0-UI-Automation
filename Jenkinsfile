pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'
    }

    environment {
        TAGS = '@smoke'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '20'))
        timestamps()
        timeout(time: 60, unit: 'MINUTES')
    }

    stages {
        stage('Checkout Automation Code') {
            steps {
                checkout scm
            }
        }

        stage('Verify Node.js and npm') {
            steps {
                sh '''
                    echo "===== NODE VERSION ====="
                    node --version

                    echo "===== NPM VERSION ====="
                    npm --version

                    echo "===== WORKSPACE ====="
                    pwd
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    if [ -f package-lock.json ]; then
                        echo "Installing dependencies using npm ci"
                        npm ci
                    else
                        echo "package-lock.json not found; using npm install"
                        npm install
                    fi
                '''
            }
        }

        stage('Clean Previous Test Results') {
            steps {
                sh '''
                    if npm run | grep -q "clean:reports"; then
                        npm run clean:reports
                    else
                        echo "No clean:reports script found; skipping cleanup"
                    fi
                '''
            }
        }

        stage('Run Cypress Smoke Tests') {
            steps {
                catchError(
                    buildResult: 'FAILURE',
                    stageResult: 'FAILURE'
                ) {
                    sh '''
                        echo "===== RUNNING SMOKE TESTS ====="
                        echo "Cucumber tag filter: ${TAGS}"

                        TAGS="${TAGS}" npm run cypress:run -- --config video=true
                    '''
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                archiveArtifacts(
                    artifacts: 'cypress/reports/**/*,cypress/screenshots/**/*,cypress/videos/**/*,allure-results/**/*',
                    allowEmptyArchive: true,
                    fingerprint: true
                )
            }
        }

        stage('Publish Allure Report') {
            steps {
                script {
                    if (fileExists('allure-results')) {
                        def resultFiles = findFiles(
                            glob: 'allure-results/*-result.json'
                        )

                        if (resultFiles.length > 0) {
                            catchError(
                                buildResult: 'UNSTABLE',
                                stageResult: 'UNSTABLE'
                            ) {
                                allure(
                                    includeProperties: false,
                                    jdk: '',
                                    results: [
                                        [path: 'allure-results']
                                    ]
                                )
                            }
                        } else {
                            echo 'No Allure result JSON files found.'
                        }
                    } else {
                        echo 'allure-results directory was not generated.'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Cypress smoke tests completed successfully.'
        }

        failure {
            echo 'Cypress smoke tests failed. Review the Jenkins console and archived reports.'
        }

        always {
            echo "Final Jenkins build result: ${currentBuild.currentResult}"
        }
    }
}
