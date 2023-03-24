import { openai } from "..";

// prettier-ignore
const sanitizeMessage = (message: string) => message.trim().replace(/[\n\r]/g, "").replace(/(\w)\.$/, "$1");
const deduplicateMessages = (array: string[]) => Array.from(new Set(array));

export const generateMessage = async (prompt: string) => {
 const { data } = await openai.createChatCompletion({
  model: "gpt-3.5-turbo",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.7,
  max_tokens: 250,
  stream: false,
 });

 return deduplicateMessages(data.choices.filter((choice) => choice.message?.content).map((choice) => choice.message!.content));
};

export const editMessage = async (input: string, instruction: string) => {
 const { data } = await openai.createEdit({
  instruction,
  input,
  model: "text-davinci-edit-001",
 });

 return deduplicateMessages(data.choices.filter((choice) => choice.text).map((choice) => choice.text!));
};
