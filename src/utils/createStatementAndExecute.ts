import { Result } from 'odbc';

export async function createStatementAndExecute(
  query: string,
  params: any[],
): Promise<Result<any>> {
  const statement = await global.connection.createStatement();
  await statement.prepare(query);
  await statement.bind(params, (err) => {
    if (err) throw new Error(err.message);
  });
  const result: Result<any> = await statement.execute();
  return result;
}
