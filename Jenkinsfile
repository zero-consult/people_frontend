pipeline {
    agent {
		docker { image 'node:latest' }
	}
    stages {
        stage('Build') {
            steps {
			    sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
        stage('Deploy') {
            steps {
                sh 'npm start'
            }
        }
    }
}