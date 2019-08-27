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
		sh 'npm version patch'
		sh 'git add package.json'
		sh 'git commit -m "New Version"'
		sh 'git push'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
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
