import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
@Injectable()
export class SapService {
  async loginSAPUser(user: { code: string; password: string }): Promise<any> {
    return await axios
      .post(
        'https://sap.dfl.com.pk:50000/b1s/v1/Login',
        {
          // CompanyDB: "TESTDFL23022023",
          // CompanyDB: "DFL_LIVE",
          // Password: "7576",
          // UserName: "erp05",
          Password: user.password,
          UserName: user.code,
          CompanyDB: process.env.database,
          // CompanyDB: process.env.hana_schema,
          // CompanyDB: "APPHIERARCHY19122022",
          // Password: "1234",
          // UserName: "admin03",
        },
        {
          withCredentials: true,
          httpsAgent: new https.Agent({
            rejectUnauthorized: false,
          }),
        },
      )
      .then((res) => {
        // 'B1SESSION'
        // console.log(res);
        // console.log(res);
        // res.clearCookie("B1SESSION");
        // res.clearCookie("ROUTEID");
        // console.log(res.headers["set-cookie"]);
        // console.log('B1SESSION = ' + res.data["SessionId"]);
        // request.user['setCookies'] = res.headers['set-cookie'];
        const cookies = {
          fullCookie: res.headers['set-cookie'],
          B1SESSION: String(res.headers['set-cookie'][0])
            .split('=')[1]
            .split(';')[0],
          ROUTEID: String(res.headers['set-cookie'][1])
            .split('=')[1]
            .split(';')[0],
        };
        return cookies;
        // request.session.user.sap =;
        // request.session.user.sapSessionID = res.data['SessionId']
        // request.("B1SESSION", res.data["SessionId"], { maxAge: 1.8e+6 })
        // response.headers['set-cookie'] += res.headers['set-cookie'][0]
        // request.user.cookies = cookies;
        // response.cookie("B1SESSION", res.data["SessionId"], { maxAge: 1.8e6 });
        // response.cookie(
        //   "ROUTEID",
        //   String(res.headers["set-cookie"][1]).split("=")[1].split(";")[0],
        //   { maxAge: 1.8e6 }
        // );
        console.timeEnd('SAP Login');
        // response.cookie("ROUTEID", String(res.headers['set-cookie'][1]).split('ROUTEID=')[1])
        // console.log(res.data)
      })
      .catch((e) => {
        console.time('SAP Login');
        console.log(
          'Error Inside SAP Service Layer Login At Date: ' + new Date(),
        );
        // console.log(e.response);
        console.log(e?.response?.data?.error?.message?.value || e?.message);
        console.log(
          '---------------------------------------------------------',
        );
        if (e?.response?.data?.error?.code === 100000027) {
          throw Error('SAP Password Incorrect! Please Contact MIS!');
        } else {
          throw Error(e?.response?.data?.error?.message?.value || e?.message);
        }
        // throw Error(e?.response?.data?.error?.message?.value || e?.message);

        // throw Error(e?.response?.data.message || e?.message);
      });
  }
}
