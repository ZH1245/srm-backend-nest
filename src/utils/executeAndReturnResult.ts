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
        console.error(e.message);
        // throw new Error(e.message);
        throw new Error(
          'Server Error: Execution Context Error. Please Contact MIS! ',
        );
      });
    return result;
  } catch (e) {
    if (isTransaction) await global.connection.rollback();
    console.log(e);
    console.error(e.message);
    // throw new Error(e.message);
    throw new Error(
      'Server Error: Execution Context Error. Please Contact MIS! ',
    );
  }
}
