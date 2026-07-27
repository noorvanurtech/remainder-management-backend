import { EventEmitter } from "events";

export const appEventEmitter = new EventEmitter();

export const EVENTS = {
  JOB_CREATED: "JOB_CREATED",
  USER_REGISTERED: "USER_REGISTERED",
  ORDER_CREATED: "ORDER_CREATED",
  JOB_STATUS_UPDATED: "JOB_STATUS_UPDATED",
};
