pipeline {
    agent {
		docker { image 'node:latest' }
	}
    stages {
	    stage('Prep') {
			steps {
				sh "mkdir -p ~/.ssh"
				sh "ssh-keyscan github.com > ~/.ssh/known_hosts"
                script {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'MathiasVE',
                            keyFileVariable: 'keyFile'
                        )
                    ]) {
                        sshKey = readFile(keyFile).trim()
                    }
                }
				sh 'touch ~/.ssh/id_rsa'
				sh 'chmod 600 ~/.ssh/id_rsa'
				sh '#!/bin/sh -e\n' + "echo '${sshKey}' > ~/.ssh/id_rsa"
				sh 'chmod 400 ~/.ssh/id_rsa'
            }
		}
		stage('Tag version') {
			when {
				allOf {
					anyOf {
						branch 'production'
						branch 'testing'
						branch 'development'
					}
					expression {
						return !isVersionTag(readCurrentTag())
					}
				}
			}
			steps {
				script {
					def tagName = sh(script: "git describe --tags --always HEAD^1 || echo 'no-tag'", returnStdout: true).trim()
					if (tagName !=~ /\d+\.\d+\.\d+/) {
						env.TAG_NAME = '1.0.0'
					} else {
						env.TAG_NAME = tagName;
					}
					echo tagName
					def versionParts = env.TAG_NAME.tokenize('.')
					env.MAJOR_VERSION = versionParts[0].toInteger()
					env.MINOR_VERSION = versionParts[1].toInteger()
					env.PATCH_VERSION = versionParts[2].toInteger()
					if (tagName ==~ /\d+\.\d+\.\d+/) {
						env.PATCH_VERSION = env.PATCH_VERSION.toInteger() + 1
					}
				}
				withCredentials([sshUserPrivateKey(credentialsId: "MathiasVE", keyFileVariable: 'key')]) {
					sh "git config --global user.email 'mathias.ver.elst@gmail.com'"
					sh "git config --global user.name 'Jenkins'"
					sh "git tag -a ${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION} -m '${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION}'"
					sh "GIT_SSH='ssh -i ~/.ssh/id_rsa'"
					sh "git push git@github.com:zero-consult/people_frontend.git ${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION}"
				}
			}
		}
		stage('Build') {
            steps {
				script {
					def versionParts = readCurrentTag().tokenize('.')
					env.MAJOR_VERSION = versionParts[0].toInteger()
					env.MINOR_VERSION = versionParts[1].toInteger()
					env.PATCH_VERSION = versionParts[2].toInteger()
				}
			    sh "sed -i 's/\"version\": \"0.1.0\"/\"version\": \"${env.MAJOR_VERSION}.${env.MINOR_VERSION}.${env.PATCH_VERSION}\"/' package.json"
			    sh 'npm install'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm test'
            }
        }
		stage('Build image') {
			when {
				branch "production"
			}
			steps {
				script {
					app = docker.build("people_frontend/production")
				}
			}
		}
		stage('Push image') {
			when {
				branch "production"
			}
			steps {
				script {
					docker.withRegistry('https://registry.hub.docker.com', 'git') {
					   app.push("${env.BUILD_NUMBER}")
					   app.push("latest")
					}
				}
			}
		}
        stage('Deploy') {
			when {
				branch "production"
			}
            steps {
                sh 'npm start -- --port 80 &'
            }
        }
    }
}

def boolean isVersionTag(String tag) {
    echo "checking version tag $tag"

    if (tag == null) {
        return false
    }

    def tagMatcher = tag =~ /\d+\.\d+\.\d+/

    return tagMatcher.matches()
}

def String readCurrentTag() {
    return sh(returnStdout: true, script: "git tag --points-at HEAD").trim()
}