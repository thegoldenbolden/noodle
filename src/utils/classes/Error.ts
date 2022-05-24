type PastaConstructor = {
 message: string;
 options?: ErrorOptions;
 me?: boolean;
 command?: string;
 info?: string;
};

export default class PastaError extends Error {
 me: boolean;
 info: string;
 command: string;

 constructor({ message, options, command = "", info = "", me = false }: PastaConstructor) {
  super(message, options);
  this.me = me;
  this.command = command;
  this.info = info;
 }
}
