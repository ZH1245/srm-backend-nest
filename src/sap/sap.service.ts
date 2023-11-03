import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as https from 'https';
@Injectable()
export class SapService {
  async loginSAPUser(user: { code: string; password: string }): Promise<any> {
    console.log('SAP COMPANY DB:  ', process.env.hana_schema_development);
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
          // CompanyDB: process.env.database,
          // CompanyDB: 'TESTDFL02112023',
          CompanyDB: process.env.hana_schema_development,
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
          setCookies: res.headers['set-cookie'].join(';'),
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
  async addAttachments(files: Express.Multer.File[] | { originalname: any }[]) {
    console.log(files, 'Files');
    const sapFileNames = files.map((file) => {
      const getExtension = (str) => str.slice(str.lastIndexOf('.'));
      const getName = (str) => str.slice(0, str.lastIndexOf('.'));
      return {
        FileExtension: getExtension(file.originalname).slice(1),
        FileName: getName(file.originalname),
        SourcePath: true
          ? '\\\\192.168.5.182\\SAP-Share\\'
          : '\\\\192.168.5.191\\Backup\\ZAINWEBSITETESTING\\SRM\\attachments',
        // UserID: '1',
      };
    });
    const SAPPayload = {
      Attachments2_Lines: [...sapFileNames],
    };
    console.log('Attachment Payload', SAPPayload);
    const cookiesFromSAP = await this.loginSAPUser({
      code: 'admin03',
      password: 'hamza@815',
    });
    return await axios
      .post('https://sap.dfl.com.pk:50000/b1s/v1/Attachments2', SAPPayload, {
        withCredentials: true,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
        headers: {
          // cookies: `B1SESSION=${cookies['B1SESSION']},ROUTEID=${cookies['ROUTEID']}`,
          cookies: cookiesFromSAP.fullCookie.join(','),
          cookie: `${cookiesFromSAP['setCookies']}`,
        },
      })
      .then((res) => {
        console.log(res.data, ' Attachments');
        return { data: res.data, AbsoluteEntry: res.data.AbsoluteEntry };
      })
      .catch((e) => {
        console.log(e?.response?.data?.error?.message?.value || e?.message);
        throw Error(e?.response?.data?.error?.message?.value || e?.message);
      });
    // console.log(sapEntry.data, 'Attachments');
  }
}
