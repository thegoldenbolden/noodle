type Constructor = {
 message: string;
 options?: ErrorOptions;
 log?: boolean;
 command?: string;
 user?: string;
 info?: string;
};

export default class BotError extends Error {
 log: boolean;
 info: string;
 command: string;
 user: string;

 constructor({ message, options, command = "", info = "", user = "", log = false }: Constructor) {
  super(message, options);
  this.log = log ?? false;
  this.command = command;
  this.user = user;
  this.info = info;
 }
}
