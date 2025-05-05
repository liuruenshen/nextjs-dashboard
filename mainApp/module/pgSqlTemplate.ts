export type Primitive = string | number | boolean | undefined | null;

export function pgSqlTemplate(
  template: TemplateStringsArray,
  ...values: Primitive[]
) {
  let result = template[0];
  for (let i = 1; i < template.length; i++) {
    result += `$${i}${template[i]}`;
  }

  return [result, values];
}
