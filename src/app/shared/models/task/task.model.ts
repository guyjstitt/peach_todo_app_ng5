import * as _ from 'lodash';
import * as moment from 'moment-timezone';

import { BaseModel } from '../base.model';
import { DB_DATE_FORMAT } from '../../../app.const';
import { User } from '../user/user.model';

const API_KEY = 'bynddev_tasks';
const FIELDS = ['assigned_user_id', 'description', 'due_date', 'is_complete', 'location_id'];

export class Task extends BaseModel {

  protected _assigned_user_id: number | User;
  protected _description: string;
  protected _due_date: string | Date;
  protected _is_complete: boolean;
  protected _location_id: number;

  get assignedUserId(): number | User {
    return this._assigned_user_id;
  }

  get assignedUsername(): string {
    return (this._assigned_user_id instanceof User) ?
      this._assigned_user_id.userName :
      User.getDefaultUserName();
  }

  get description(): string {
    return this._description;
  }

  get dueDate(): string | Date {
    return this._due_date;
  }

  get isComplete(): boolean {
    return this._is_complete;
  }

  set assignedUserId(userID: number | User) {
    this._assigned_user_id = userID;
  }

  set description(description: string) {
    this._description = description;
  }

  set isComplete(isComplete: boolean) {
    this._is_complete = isComplete;
  }

  set dueDate(dueDate: string | Date) {
    this._due_date = dueDate;
  }

  constructor(rawData: object = {}) {

    super(rawData);

    _.each(
      _.pick(rawData, ...FIELDS),
      (value, key) => {
        this[`_${key}`] = value;
      }
    );

  }

  public forDB(): object {

    let dbObject: object = {};

    _.each(
      FIELDS,
      (fieldName) => {
        dbObject[fieldName] = this[`_${fieldName}`];
      }
    );

    // before sending to database, we need to replace user object data back with the user id
    if (this._assigned_user_id instanceof User) {
      dbObject['assigned_user_id'] = this._assigned_user_id.id;
    }

    if (_.isDate(this._due_date)) {
      dbObject['due_date'] = moment(this._due_date).format(DB_DATE_FORMAT);
    }

    if (this.id) {
      dbObject['id'] = this.id;
    }

    return dbObject;

  }

  toggleStatus(): boolean {
    return this._is_complete = !this._is_complete;
  }

  static getApiKey(): string {
    return API_KEY;
  }

  static fromRaw(data: any = null): Task | Array<Task> {

    if (_.isArray(data)) {

      let tasks = [];

      _.each(
        data,
        (t) => {

          if (_.isObject(t.assigned_user_id)) {
            t.assigned_user_id = User.fromRaw(t.assigned_user_id);
          }

          tasks.push(new Task(t));

        }
      );

      return tasks;

    }

    if (_.isObject(data)) {

      if (_.isObject(data.assigned_user_id)) {
        data.assigned_user_id = User.fromRaw(data.assigned_user_id);
      }

      let task = new Task(data);

      return task;

    }

    return null;

  }

  static isValid(task: any = null): boolean {

    return task &&
      task instanceof Task &&
      (
        _.isNumber(task._assigned_user_id) ||
        User.isValid(task._assigned_user_id)
      ) &&
      _.isString(task._description) &&
      task._description.length <= 256 &&
      _.isBoolean(task._is_complete) &&
      _.isNumber(task._location_id);

  }

}
