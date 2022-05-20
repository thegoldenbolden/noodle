import { Pasta, pool } from "../../index.js";
import { BotError } from "../classes/Error.js";
import { ArrayParams, GuildProfile, QueryArgs, SessionProfile, UserProfile } from "../typings/database";

export const query = async <T extends UserProfile | GuildProfile>(query: string, ...params: any[]) => {
  console.log(query);
  return await pool.query<T>(query, params).catch((err) => {
    console.group("Error");
    console.log(query);
    console.log(err);
    console.groupEnd();
    throw err;
  });
};

export const create = async ({ table }: QueryArgs) => {
  const name = table === "guilds" ? defaultGuild() : defaultUser();
  return await query(`CREATE TABLE IF NOT EXISTS ${table}(${name});`);
};

export const drop = async ({ table }: QueryArgs) => {
  return await query(`DROP TABLE IF EXISTS ${table}`);
};

export const insert = async <T extends UserProfile | GuildProfile>(args: QueryArgs) => {
  const params = args.table === "guilds" ? "(discord_id)" : "(discord_id, birthday, username)";
  const values = args.table === "guilds" ? `('${args.discord_id}')` : `('${args.discord_id}', current_timestamp, '${args.username}')`;
  const update = await query<T>(`INSERT INTO ${args.table} ${params} VALUES ${values} ON CONFLICT DO NOTHING RETURNING *`);

  if (update.rows?.[0]) {
    Pasta[args.table].set(`${args.discord_id}`, update.rows?.[0] as any);
  }

  return update;
};

export const get = async <T extends UserProfile | GuildProfile>(args: QueryArgs) => {
  if (!args.discord_id) throw new BotError("I was unable to find your profile.");
  let data = Pasta[args.table].get(args.discord_id) as SessionProfile<T>;

  if (data) {
    return data as SessionProfile<T>;
  }

  const { rows: select } = await query<UserProfile | GuildProfile>(`SELECT * FROM ${args.table} WHERE discord_id='${args.discord_id}'`);

  data = select[0] as any;

  if (!select[0]) {
    const { rows: create } = await insert(args);
    if (!create[0]) throw new BotError(`I was unable to create your profile.`);
    data = create[0] as any;
  }

  Pasta[args.table].set(data.discord_id, data as any);

  // Clear user after 3 hours..
  const timeout = setTimeout(() => {
    Pasta[args.table].delete(data.discord_id);
    clearTimeout(timeout);
  }, 60000 * 60 * 3);

  return Pasta[args.table].get(data.discord_id) as SessionProfile<T>;
};

function defaultUser() {
  const user: UserProfile = {
    discord_id: "",
    username: null,
    birthday: null,
    notifications: [],
    noodles: {
      pocket: 1000,
      bank: 0,
      daily_claimed: false,
      last_daily: null,
      bless_streak: 0,
    },
  };

  return `discord_id VARCHAR(50) PRIMARY KEY NOT NULL,
			\rbirthday timestamp DEFAULT current_timestamp,
			\rusername VARCHAR(40),
			\rnotifications jsonb DEFAULT '[]',
			\rnoodles jsonb DEFAULT '${JSON.stringify(user.currency)}'`;
}

function defaultGuild() {
  const guild: GuildProfile = {
    discord_id: "",
    channels: {
      starboard: null,
      logger: null,
    },
    notifications: [],
    autoroles: [],
    settings: {
      autoroles_limit: 25,
    },
  };

  return `discord_id VARCHAR(50) PRIMARY KEY NOT NULL,
				\nnotifications jsonb DEFAULT '[]',
				\rautoroles jsonb DEFAULT '[]',
				\rchannels jsonb DEFAULT '${JSON.stringify(guild.channels)}',
				\rsettings jsonb DEFAULT '${JSON.stringify(guild.settings)}'`;
}

export async function addObjectToDbArray(args: ArrayParams) {
  const q = `UPDATE ${args.table}
 						\rSET ${args.column} =
 							\rCOALESCE(${args.column}, '[]'::jsonb) || '${JSON.stringify(args.updateValue)}'::jsonb
 						\rWHERE discord_id='${args.discord_id}' RETURNING "${args.column}"`;

  const update = await query(q);
  if (!update.rows[0]) {
    throw new BotError(`We failed to update ${args.table === "guilds" ? "this server's" : "your"} profile.`);
  }

  const collection = Pasta[args.table].get(args.discord_id);
  if (collection) {
    collection[`${args.column}`] = update.rows[0][`${args.column}`];
  }

  return update;
}

export async function deleteObjectFromDbArray(args: ArrayParams) {
  const arrayElements = `jsonb_array_elements(${args.column}) with ordinality arr(item_object, position)`;
  const q = `
       \rUPDATE ${args.table} SET ${args.column} = ${args.column} -
       \rCast(
								\r(
       	\r	SELECT position - 1
       		\rFROM ${args.table}, ${arrayElements}
       		\rWHERE discord_id='${args.discord_id}' and item_object->>'${args.lookup}' = '${args.lookupValue}'
								\r) 
							\ras int)
						\rWHERE discord_id='${args.discord_id}' RETURNING "${args.column}"`;

  const update = await query(q);
  if (!update.rows[0]) {
    throw new BotError(`We failed to update ${args.table === "guilds" ? "this server's" : "your"} profile.`);
  }

  const collection = Pasta[args.table].get(args.discord_id);
  if (collection) {
    collection[`${args.column}`] = update.rows[0][`${args.column}`];
  }

  return update;
}

export async function editObjectFromDbArray(args: ArrayParams) {
  // key - The key to update
  const q = `
							\rWITH item AS (
								\rSELECT ('{' || index - 1  || ',"${args.key}"}')::TEXT[] AS path, discord_id
								\rFROM ${args.table},	jsonb_array_elements(${args.column}) WITH ORDINALITY arr(item, index)
								\rWHERE item ->> '${args.lookup}' = '${args.lookupValue}'
							\r)
							\rUPDATE ${args.table}
							\rSET	${args.column} = jsonb_set(${args.column}, item.path, '${JSON.stringify(args.updateValue)}'::jsonb)
							\rFROM item
							\rWHERE ${args.table}.discord_id = item.discord_id RETURNING "${args.column}"`;

  const update = await query(q);
  if (!update.rows[0]) {
    throw new BotError(`We failed to update ${args.table === "guilds" ? "this server's" : "your"} profile.`);
  }

  const collection = Pasta[args.table].get(args.discord_id);
  if (collection) {
    collection[`${args.column}`] = update.rows[0][`${args.column}`];
  }

  return update;
}

type Params = {
  table: "guilds" | "users";
  column: string;
  discord_id: string;
  path: string[];
  newValue: any;
};

export async function updateObjectInDb(args: Params) {
  const path = "'{" + args.path.join(",") + "}'";

  const q = `
		\rUPDATE ${args.table} 
		\rSET ${args.column} = jsonb_set(${args.column}, ${path}, '${JSON.stringify(args.newValue)}')
		\rWHERE discord_id='${args.discord_id}' RETURNING "${args.column}"
	`;

  const update = await query(q);
  if (!update.rows[0]) {
    throw new BotError(`We failed to update ${args.table === "guilds" ? "this server's" : "your"} profile.`);
  }

  const collection = Pasta[args.table].get(args.discord_id);
  if (collection) {
    collection[`${args.column}`] = update.rows[0][`${args.column}`];
  }

  return update;
}

// array: async function (args: ArrayParams) {
//   const arrayElements = `jsonb_array_elements(${args.column}) with ordinality arr(item_object, position)`;
//   let query: string = "";
//   switch (args.type) {
//     case "get":
//       query = `
// 						SELECT arr.position, arr.item_object
// 						FROM ${args.table},
// 						${arrayElements}
// 						WHERE discord_id='${args.discord_id}' AND arr.position=Cast((
// 								SELECT arr.position
// 								FROM ${args.table}, ${arrayElements}
// 								WHERE discord_id='${args.discord_id}' AND arr.item_object->>'${args.key}' = '${args.value}'
// 							) as int)`;
//       break;
//     case "edit":

//       break;
//   }

//   return await this.query(query);
// },
// json: async function <T extends User | Guild>(args: JSONParams) {
//   let query: string = "";

//   switch (args.type) {
//     case "add":
//       query = `
// 					UPDATE ${args.table}
// 					SET ${args.column} =
// 						jsonb_set(
// 							${args.column},
// 							'{${args.path}}',
// 							'${JSON.stringify(args.value)}'::jsonb)
// 					WHERE discord_id='${args.discord_id}'`;
//       break;
//   }

//   query += ` RETURNING "${args.column}"`;
//   return await this.query<User | Guild | T>(query);
// },

// UPDATE items i
// SET    images = i2.images
// FROM  (
//   SELECT id, array_to_json(array_agg(elem)) AS images
//   FROM   items cand
//        , json_array_elements(cand.images) elem
//   WHERE  cand.images @> '{[{"id":"note_1"}]}'::jsonb
//   AND    elem->>'id' <> 'note_1'
//   GROUP  BY 1
//   ) i2
// WHERE i2.id = i.id;
