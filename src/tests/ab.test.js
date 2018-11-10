const json = require('./icloud/query_setting.json');

test('test query setting 2', () => {
    expect(json.records).not.toBeNull();
});
