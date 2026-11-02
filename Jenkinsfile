pipeline {
    agent any

    environment {
        // Docker Hub Configuration
        DOCKER_HUB_REPO   = 'yourdockerhubusername/foodexpress'
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        DOCKER_CREDS_ID   = 'docker-hub-credentials' // Stored in Jenkins Credentials Store

        // AWS EC2 Deployment Configuration
        EC2_USER          = 'ubuntu'
        EC2_HOST          = 'your-ec2-public-ip-or-dns'
        EC2_KEY_CREDS_ID  = 'aws-ec2-ssh-key' // Jenkins Secret SSH Key ID
        DEPLOY_PATH       = '/home/ubuntu/foodexpress'
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
    }

    stages {
        // Stage 1: Checkout Source Code
        stage('Checkout Code') {
            steps {
                echo '📥 Checking out latest source code from GitHub repository...'
                checkout scm
            }
        }

        // Stage 2: Install Node Dependencies
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing project dependencies...'
                sh 'npm ci'
            }
        }

        // Stage 3: Automated Testing
        stage('Run Tests') {
            steps {
                echo '🧪 Running unit, integration, and security tests with Jest & Supertest...'
                sh 'npm test'
            }
        }

        // Stage 4: Build Docker Image
        stage('Build Docker Image') {
            steps {
                echo "🐳 Building Docker image ${DOCKER_HUB_REPO}:${IMAGE_TAG}..."
                sh "docker build -t ${DOCKER_HUB_REPO}:${IMAGE_TAG} -t ${DOCKER_HUB_REPO}:latest ."
            }
        }

        // Stage 5 & 6: Docker Hub Authentication & Push
        stage('Push Image to Docker Hub') {
            steps {
                echo '🔐 Authenticating and pushing Docker image to Docker Hub registry...'
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh 'echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin'
                    sh "docker push ${DOCKER_HUB_REPO}:${IMAGE_TAG}"
                    sh "docker push ${DOCKER_HUB_REPO}:latest"
                    sh 'docker logout'
                }
            }
        }

        // Stage 7: Deploy to AWS EC2
        stage('Deploy to AWS EC2') {
            steps {
                echo '🚀 Deploying latest container release to AWS EC2 instance...'
                sshagent([ "${EC2_KEY_CREDS_ID}" ]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            mkdir -p ${DEPLOY_PATH}
                            cd ${DEPLOY_PATH}
                            echo "Pulling latest docker-compose and image..."
                            docker compose pull app || docker pull ${DOCKER_HUB_REPO}:latest
                            docker compose up -d --remove-orphans
                            docker image prune -f
                        '
                    """
                }
            }
        }

        // Stage 8: Health Check Verification
        stage('Verify Health') {
            steps {
                echo '🩺 Probing live application endpoint on AWS EC2...'
                sh """
                    sleep 10
                    curl -s -f http://${EC2_HOST}:3000/ > /dev/null || exit 1
                    echo "✅ Application health check verified successfully!"
                """
            }
        }
    }

    post {
        success {
            echo '🎉 FoodExpress CI/CD Pipeline Succeeded! New version is live on AWS EC2.'
        }
        failure {
            echo '❌ Pipeline failed! Please inspect logs and verify credentials.'
        }
    }
}
