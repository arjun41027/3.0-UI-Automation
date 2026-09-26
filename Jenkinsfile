pipeline {
  agent {
    label 'linux'
  }

  // Configure this NodeJS installation in Jenkins Global Tool Configuration.
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
        // Use the multibranch job's revision instead of hardcoding a branch.
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          node --version
          npm --version

          if [ -f package-lock.json ]; then
            npm ci
          else
            echo "package-lock.json not found; falling back to npm install"
            npm install
          fi
        '''
      }
    }

    stage('Cypress Tests') {
      steps {
        // Preserve FAILURE while allowing Publish Results to archive test output.
        catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
          sh 'npm run cypress:run -- --config video=true'
        }
      }
    }

    stage('Publish Results') {
      steps {
        // Archive raw output first so it remains available if report generation fails.
        archiveArtifacts(
          artifacts: 'cypress/reports/**/*.json,cypress/screenshots/**/*,cypress/videos/**/*,allure-results/**/*',
          allowEmptyArchive: true
        )

        script {
          if (fileExists('allure-results')) {
            // Allure writes one *-result.json file per test result.
            def resultFile = sh(
              script: "find allure-results -type f -name '*-result.json' -print -quit",
              returnStdout: true
            ).trim()

            if (resultFile) {
              // Requires the Allure Jenkins plugin and an Allure tool configured in Jenkins.
              catchError(buildResult: 'SUCCESS', stageResult: 'UNSTABLE') {
                allure includeProperties: false, jdk: '', results: [[path: 'allure-results']]
              }
            } else {
              echo 'No Allure test results found; skipping Jenkins report publication.'
            }
          } else {
            echo 'No Allure results directory found; skipping Jenkins report publication.'
          }
        }
      }
    }
  }

  post {
    always {
      echo 'Cypress pipeline completed; available test artifacts are archived.'
    }
    success {
      echo 'Cypress test run succeeded.'
    }
    failure {
      echo 'Cypress pipeline failed. Review the build log and archived artifacts.'
    }
  }
}
