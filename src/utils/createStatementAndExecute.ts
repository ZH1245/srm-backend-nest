import { OdbcError, Result } from 'odbc';

export async function createStatementAndExecute(
  query: string,
  params: any[],
): Promise<Result<any>> {
  const stringParams = params.map((p) => {
    return String(p);
  });
  const statement = await global.connection.createStatement();
  await statement.prepare(query).catch((e: OdbcError) => {
    console.log(e.message, e.code);
    throw new Error(e.message);
  });
  await statement.bind(stringParams, (err) => {
    if (err) throw new Error(err.message);
  });
  const result: Result<any> = await statement
    .execute()
    .catch((e: OdbcError) => {
      console.log(e);
      console.log(e.message);
      console.log('----------------------------------------');
      console.log(query, stringParams);

      throw new Error(e.message);
    });
  await statement.close();
  return result;
}
