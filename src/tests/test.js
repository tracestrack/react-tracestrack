const json = require('./icloud/query_setting.json');

test('test query setting', () => {
    expect(json.records).not.toBeNull();
});
