import {Body, Controller, Get, Inject, Post, Query} from '@midwayjs/core';
import {Context} from '@midwayjs/koa';
import {UserService} from '../service/user.service';
import * as fs from "node:fs";

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
  }){
    await fs.promises.writeFile(`data/savedUsrData/${form.usrName}.json`, JSON.stringify(form.taskList, null, 2), "utf-8");
    return { success: true, message: 'OK', data: form };
  }

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
    console.log(table);

    await fs.promises.writeFile("data/usr-password.json", JSON.stringify(table, null, 2));

    let initialTaskList = await fs.promises.readFile("data/initialTaskList.json");
    await fs.promises.writeFile(`data/savedUsrData/${form.usrName}.json`, initialTaskList);
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
      let taskList = JSON.parse(await fs.promises.readFile(`data/savedUsrData/${form.usrName}.json`, 'utf-8'));
      return {message: "success", taskList: taskList};
    } else return {message: "fail", taskList: {}};
  }
}
