export type Primitive = string | number | boolean | undefined | null;
import format from 'pg-format';

const FORMAT_TAG_SEPARATOR = '/';

/**
 * Conversion specifications for pg-format (%%, %L, %s, %I)
 */
const FORMAT_TAGS: Record<string, string> = {
  L: 'L',
  I: 'I',
  '%': '%',
  s: 's',
};

/**
 * We have to use pg-format to construct the dynamic SQL query
 */
export function pgFormatTemplate(
  template: TemplateStringsArray,
  ...values: Primitive[]
): string {
  let result = template[0];
  for (let i = 1; i < template.length; i++) {
    const value = values[i - 1];
    let literalValue = value;
    let formatTag = 'L';
    if (typeof value === 'string') {
      const index = value.lastIndexOf(FORMAT_TAG_SEPARATOR);
      if (index !== -1) {
        literalValue = value.slice(0, index);
        formatTag = value.slice(index + FORMAT_TAG_SEPARATOR.length);
        if (!FORMAT_TAGS[formatTag]) {
          formatTag = 'L';
        }
      }
    }

    result += `%${formatTag}${template[i]}`;
    values[i - 1] = literalValue;
  }

  return format(result, ...values);
}
