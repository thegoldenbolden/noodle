import { AxiosRequestConfig } from "axios";
import { ChatInputCommandInteraction, GuildMember } from "discord.js";

type AxiosParams = {
 name: string;
 url: string;
 interaction?: ChatInputCommandInteraction;
 config?: AxiosRequestConfig<any>;
 cache?: {
  time: number;
 };
};

type LogParams = {
	name: string;
	callback: (...x: any[]) => Promise<any>;
	params?: any[]
}


export interface Helpers {
	GetColor: (member? : GuildMember | null | undefined) => number;
 Ordinal: (x: number) => string;
	UseAxios: (x: AxiosParams) => Promise<any>;
	UseLog: (x: LogParams) => Promise<any>;
	Split: (array: any[], length: number, transform: (e: any, idx: number) => any) => any[]
}
