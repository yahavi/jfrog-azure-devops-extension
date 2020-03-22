const testUtils = require('../../../testUtils');

let inputs = {
    buildName: 'npmCiTest',
    buildNumber: '2'
};

testUtils.runTask(testUtils.publish, {}, inputs);
