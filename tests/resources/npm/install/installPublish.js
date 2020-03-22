const testUtils = require('../../../testUtils');

let inputs = {
    buildName: 'npmInstallTest',
    buildNumber: '1'
};

testUtils.runTask(testUtils.publish, {}, inputs);
