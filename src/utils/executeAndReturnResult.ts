import type { Result } from 'odbc';

type Params = string;
export async function executeAndReturnResult(
  params: Params,
  isTransaction = false,
) {
  try {
    console.log(params);
    const result: Result<any> = await global.connection
      .query(params)
      .catch((e) => {
        // console.log(params);
        console.log(e);
        throw new Error(e.message);
      });
    return result;
  } catch (e) {
    if (isTransaction) await global.connection.rollback();
    console.log(e);
    throw new Error(e.message);
  }
}
