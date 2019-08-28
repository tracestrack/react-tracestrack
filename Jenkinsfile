pipeline {
    agent {
        docker {
            image 'react-tracestrack-node'
            args '-p 3000:3000'
        }

    }
    environment { 
        CI = 'true'
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
		sh 'cp /root/.env.production ./'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deliver (Master)') { 
            when {
                branch 'master'
            }
            steps {
                dir("${env.WORKSPACE}"){
                    sh './deploy.sh'
                }
            }
        }
        stage('Version Bump (Master)') { 
            when {
                branch 'master'
            }
            steps {
		sh 'git tag'
		sh 'npm version patch'
		sh 'git push gh --tags'
                sh 'git push gh master'
            }
        }
    }
}
