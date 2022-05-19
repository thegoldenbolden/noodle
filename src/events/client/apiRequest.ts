import { APIRequest } from "@discordjs/rest";

export default {
  name: "apiRequest",
  async execute(request: APIRequest) {
    console.group("Request Buddy");
    console.count("Request");
    console.log(request);
    console.groupEnd();
    console.log();
  },
};
