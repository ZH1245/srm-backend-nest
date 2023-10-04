export function validateSQL(input: string): boolean {
  const sqlRegex =
    /(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|UNION|JOIN|WHERE|FROM|GROUP BY|HAVING|ORDER BY)/i;
  return sqlRegex.test(input);
}
