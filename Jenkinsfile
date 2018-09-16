node {
    cleanWs()
    sh '''#!/bin/bash
        echo "Downloading npm..."
        wget https://nodejs.org/dist/v8.9.0/node-v8.9.0-linux-x64.tar.xz
        tar -xvf node-v8.9.0-linux-x64.tar.xz
        export PATH=$PATH:$PWD/node-v8.9.0-linux-x64/bin/

        npm run release -- --commit-changes -v $VSTS_VERSION
    '''
}