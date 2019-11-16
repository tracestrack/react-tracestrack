'strict';

export function getValueFromCKKeyValues(key, records) {
  for (var i = records.length - 1; i >=0; i --) {
    if (records[i].fields.key.value === key) {
      return records[i].fields.value.value;
    }
  }
  return -1;
}
