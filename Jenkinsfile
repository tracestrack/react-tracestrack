pipeline {
    agent {
        docker {
            image 'node'
            args '-p 3000:3000'
        }

    }
    stages {
        stage('Install dependencies') {
            steps {
                sh 'npm version'
                sh 'npm install'
            }
        }
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'CI=true npm test'
            }
        }
        stage('Deliver') { 
            steps {
                dir("${env.WORKSPACE}"){
                    sh './deploy.sh'
                }
            }
        }
    }
}
