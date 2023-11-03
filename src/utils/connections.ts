// ----------------------------------------------------------------------------
import * as moment from 'moment';
import { Connection, connect } from 'odbc';
// -----------------------------------------------------------------------

/**
 * The driver for the database.
 */
const driver = process.env.hana_driver;
/**
 * The host for the database.
 */
const host = process.env.hana_host;
/**
 * The database name.
 */
const db_name = process.env.hana_dbname;
/**
 * The schema for the database.
 */
// const schema = process.env.hana_schema_development;
const schema =
  'CURRENTSCHEMA=TESTDFL' + moment().format('DDMMYYYY').toString() + ';';
process.env.hana_schema_development = schema;
/**
 * The username for the database.
 */
const uid = process.env.hana_uid;
/**
 * The password for the database.
 */
const pwd = process.env.hana_pwd;
/**
 * The connection string for the database.
 */
const connectionString = driver + host + db_name + schema + uid + pwd;
/**
 * Creates a connection to the database using the provided connection string.
 * @returns A Promise that resolves to the database connection object.
 */
export async function createConnection() {
  /**
   * The database connection object.
   */
  // console.log(connectionString);
  const connection: Connection = await connect(connectionString)
    .then((value) => {
      /**
       * The success message.
       */
      console.log('Connection Successful on Database: ' + schema.split('=')[1]);
      return value;
    })
    .catch((err) => {
      /**
       * The error message.
       */
      console.log('Connection Failed with Error: ' + err + '\n');
      throw err;
    });
  global.connection = connection;
}
