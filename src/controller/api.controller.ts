import {Body, Controller, Get, Inject, Post, Query} from '@midwayjs/core';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import * as fs from "node:fs";
import * as path from "node:path";

@Controller('/api')
export class APIController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  @Get('/get_user')
  async getUser(@Query('uid') uid) {
    const user = await this.userService.getUser({ uid });
    return { success: true, message: 'OK', data: user };
  }

  @Get('/hello')
  async getHello() {
    return { message: 'Hello from Midway!' };
  }
}

@Controller("task")
export class TaskController {
  @Get("/getExample")
  async getTaskList() {
    return await fs.promises.readFile("data/initialTaskList.json");
  }

  @Get("/getUsrTaskList")
  async getUsrTaskList() {
    return await fs.promises.readFile("data/savedUsrData/usrTask.json");
  }

  @Post("/save")
  async saveTask(@Body() form: {
    taskList: {
      todo: string[];
      undergoing: string[];
      done: string[];
    };
    usrName: string;
    projectName: string;
  }){
    console.log(form);
    await fs.promises.writeFile(`data/savedUsrData/${form.usrName}/${form.projectName}/${form.usrName}.json`, JSON.stringify(form.taskList, null, 2), "utf-8");
    return { success: true, message: 'OK', data: form };
  }

  @Post("/addComment")
  async addComment(@Body() form: {
    usrName: string;
    projectName: string;
    taskName: string;
    comment: string;
  }) {
    const dicPath = path.join("data/savedUsrData", form.usrName, form.projectName, "comments.json");

    let commentDic = fs.existsSync(dicPath) ? JSON.parse(fs.readFileSync(dicPath, 'utf-8')) : {};
    if(form.taskName in commentDic) {
      commentDic[form.taskName].push(form.comment);
    } else {
      commentDic[form.taskName] = [form.comment];
    }

    fs.writeFileSync(dicPath, JSON.stringify(commentDic, null, 2));
  }

  @Post("/getCommentList")
  async getCommentList(@Body() form: {
    usrName: string;
    projectName: string;
    taskName: string;
  }) {
    const dicPath = path.join("data/savedUsrData", form.usrName, form.projectName, "comments.json");
    let commentDic = fs.existsSync(dicPath) ? JSON.parse(fs.readFileSync(dicPath, 'utf-8')) : {};
    if(form.taskName in commentDic) {
      return commentDic[form.taskName];
    } else return [];
  }

  // @Post("/uploadAttachment")
  // async saveAttachment(ctx: Context) {
  //   console.log(ctx.request.files.file);
  //   return;
  // }
}

@Controller("accounts")
export class AccountController {
  currentUsrName: string;

  @Post("/create")
  async createAccount(@Body() form: {
    usrName: string;
    password: string;
  }) {
    this.currentUsrName = form.usrName;

    let table = JSON.parse(await fs.promises.readFile('data/usr-password.json', 'utf-8'));

    table[form.usrName] = form.password;

    await fs.promises.writeFile("data/usr-password.json", JSON.stringify(table, null, 2));

    let tarDirName = path.join("data/savedUsrData", form.usrName);
    fs.mkdirSync(tarDirName, { recursive: true });
    tarDirName = path.join(tarDirName, "示例项目");
    fs.mkdirSync(tarDirName, { recursive: true });
    fs.mkdirSync(path.join(tarDirName, "attachments"), { recursive: true });

    let initialTaskList = await fs.promises.readFile("data/initialTaskList.json");
    await fs.promises.writeFile(`data/savedUsrData/${form.usrName}/示例项目/${form.usrName}.json`, initialTaskList);
    return initialTaskList;
  }

  @Post("/login")
  async login(@Body() form: {
    usrName: string;
    password: string;
  }){
    console.log(form);

    let table = JSON.parse(await fs.promises.readFile('data/usr-password.json', 'utf-8'));
    if(table[form.usrName] == form.password){
      let taskList = JSON.parse(await fs.promises.readFile(`data/savedUsrData/${form.usrName}/示例项目/${form.usrName}.json`, 'utf-8'));
      return {message: "success", taskList: taskList};
    } else return {message: "fail", taskList: {}};
  }
}

@Controller("project")
export class ProjectController {
  @Post("/create")
  async createProject(@Body() form: {
    usrName: string;
    projectName: string;
  }) {
    let dir = path.join("data/savedUsrData", form.usrName);
    fs.mkdirSync(path.join(dir, form.projectName), { recursive: true });
    fs.mkdirSync(path.join(dir, form.projectName, "attachments"), { recursive: true });

    let initialTaskList = await fs.promises.readFile("data/emptyTaskList.json");

    await fs.promises.writeFile(path.join(dir, form.projectName, `${form.usrName}.json`), initialTaskList, "utf-8");
  }

  @Post("/load")
  async loadProject(@Body() form: {
    usrName: string;
    projectName: string;
  }) {
    console.log(form);
    let projectDir = path.join("data/savedUsrData", form.usrName, form.projectName, `${form.usrName}.json`);
    return await fs.promises.readFile(projectDir);
  }

  @Post("/download")
  async downloadProjectList(@Body() form: {
    usrName: string;
  }) {
    const directoryPath = path.join("data/savedUsrData", form.usrName);
    const files = fs.readdirSync(directoryPath);
    let projectList = [];

    files.forEach(file => {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        projectList.push(file);
      }
    });

    return projectList;
  }
}

@Controller('upload')
export class UploadController {
  @Post('/')
  async upload(@Body() form: { usrName: string; projectName: string; taskName: string;}) {
    // console.log(this.ctx);
    console.log(form);
    // const file = ctx.request.body.file;
    // console.log(file.name);
    // const filePath = path.join(__dirname, '../uploads', file.name);
    //
    // const reader = fs.createReadStream(file.path);
    // const stream = fs.createWriteStream(filePath);
    // reader.pipe(stream);

    // ctx.body = {
    //   message: '文件上传成功',
    //   filePath: `/uploads/${file.name}`
    // };
  }
}
