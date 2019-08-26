pipeline {
    agent {
        docker {
            image 'node'
            args '-p 3000:3000'
        }

    }
    stages {
        stage('Build') {
            steps {
                sh 'npm version'
                sh 'npm install'
            }
        }
        stage('Test') {
            steps {
                sh 'CI=true npm test'
            }
        }
        stage('Deliver') { 
            steps {
                sh 'cd ${WORKSPACE}; ./deploy'
            }
        }
    }
}
