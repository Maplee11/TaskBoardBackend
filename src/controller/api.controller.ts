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
  }sf

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
    return await fs.promises.readFile("data/usrTask.json");
  }

  @Post("/save")
  async saveTask(@Body() form: {
    todo: string[];
    undergoing: string[];
    done: string[];
  }){
    console.log(form);
    await fs.promises.writeFile("data/usrTask.json", JSON.stringify(form, null, 2), "utf-8");
    return { success: true, message: 'OK', data: form };
  }
}
