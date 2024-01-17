type Constructor = {
 message: string;
 log?: boolean;
 command?: string;
 user?: string;
 info?: string;
};

export class BotError extends Error {
 log: boolean;
 info: string;
 command: string;
 user: string;

 constructor({
  message,
  command = "",
  info = "",
  user = "",
  log = false,
 }: Constructor) {
  super(message);
  this.log = log ?? false;
  this.command = command;
  this.user = user;
  this.info = info;
 }
}
