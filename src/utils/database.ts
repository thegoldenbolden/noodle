import { Pasta, pool } from "../index.js";
import {
  GuildProfile,
  MedalDescription,
  QueryArgs,
  SessionProfile,
  UserProfile,
} from "./types/database";

export const query = async <T extends UserProfile | GuildProfile>(
  query: string,
  ...params: any[]
) => {
  return await pool.query<T>(query, params).catch((err) => {
    console.log(err);
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

export const insert = async <T extends UserProfile | GuildProfile>(
  args: QueryArgs
) => {
  const params = args.table === "guilds" ? "(id)" : "(id, birthday, username)";
  const values =
    args.table === "guilds"
      ? `('${args.id}')`
      : `('${args.id}', current_timestamp, '${args.username}')`;

  return await query<T>(
    `INSERT INTO ${args.table} ${params} VALUES ${values} ON CONFLICT DO NOTHING RETURNING *`
  );
};

export const get = async <T extends UserProfile | GuildProfile>(
  args: QueryArgs
) => {
  if (!args.id) throw new Error("I was unable to find your profile.");
  let data = Pasta[args.table].get(args.id) as SessionProfile<T>;

  if (data) {
    return data as SessionProfile<T>;
  }

  const { rows: select } = await query<UserProfile | GuildProfile>(
    `SELECT * FROM ${args.table} WHERE id='${args.id}'`
  );

  data = select[0] as any;

  if (!select[0]) {
    const { rows: create } = await insert(args);
    if (!create[0]) throw new Error(`I was unable to create your profile.`);
    data = create[0] as any;
  }

  data.session = true;
  Pasta[args.table].set(data.id, data as any);

  const timeout = setTimeout(() => {
    Pasta[args.table].delete(data.id);
    clearTimeout(timeout);
  }, 1000 * 60 * 60 * 3);

  return Pasta[args.table].get(data.id) as SessionProfile<T>;
};

function defaultUser() {
  const user: UserProfile = {
    id: "",
    username: null,
    birthday: null,
    fame: {
      xp: 0,
      rep: 0,
      rank: 0,
      medal: "Pasta Rookie",
      medals: [
        {
          name: "Pasta Rookie",
          earned: 1,
          description: MedalDescription["Pasta Rookie"],
        },
      ],
    },
    alerts: [],
    noodles: {
      inHand: 1000,
      inBank: 0,
      dailyClaimed: false,
      lastDaily: null,
      blessStreak: 0,
    },
    privacy: {
      shareStats: true,
    },
    stories: [],
    stats: {
      blackjack: {
        wins: 0,
        losses: 0,
        ties: 0,
        busts: 0,
      },
    },
  };

  return `id VARCHAR(50) PRIMARY KEY NOT NULL,
			\rbirthday timestamp DEFAULT current_timestamp,
			\rusername VARCHAR(40),
			\rfame jsonb DEFAULT '${JSON.stringify(user.fame)}',
			\ralerts jsonb DEFAULT '${JSON.stringify(user.alerts)}',
			\rnoodles jsonb DEFAULT '${JSON.stringify(user.noodles)}',
			\rprivacy jsonb DEFAULT '${JSON.stringify(user.privacy)}',
			\rstories jsonb DEFAULT '${JSON.stringify(user.stories)}',
			\rstats jsonb DEFAULT '${JSON.stringify(user.stats)}'`;
}

function defaultGuild() {
  const guild: GuildProfile = {
    id: "",
    alerts: [],
    blacklist: {
      links: [],
      commands: [],
      words: [],
    },
    channels: {
      starboard: null,
      logger: null,
      alerts: null,
    },
    warnings: [],
    autoroles: [],
    autoresponse: [],
    settings: {
      autorolesLimit: 10,
    },
  };

  return `id VARCHAR(50) PRIMARY KEY NOT NULL,
				\ralerts jsonb DEFAULT '${JSON.stringify(guild.alerts)}',
			\rblacklist jsonb DEFAULT '${JSON.stringify(guild.blacklist)}',
			\rchannels jsonb DEFAULT '${JSON.stringify(guild.channels)}',
			\rwarnings jsonb DEFAULT '${JSON.stringify(guild.warnings)}',
			\rautoroles jsonb DEFAULT '${JSON.stringify(guild.autoroles)}',
			\rautoresponse jsonb DEFAULT '${JSON.stringify(guild.autoresponse)}',
			\rsettings jsonb DEFAULT '${JSON.stringify(guild.settings)}'`;
}

// array: async function (args: ArrayParams) {
//   const arrayElements = `jsonb_array_elements(${args.column}) with ordinality arr(item_object, position)`;
//   let query: string = "";
//   switch (args.type) {
//     case "add":
//       query = `
// 						UPDATE ${args.table}
// 						SET ${args.column} =
// 							COALESCE(${args.column}, '[]'::jsonb) || '${JSON.stringify(args.value)}'::jsonb
// 						WHERE id='${args.id}' RETURNING "${args.column}"`;
//       break;
//     case "get":
//       query = `
// 						SELECT arr.position, arr.item_object
// 						FROM ${args.table},
// 						${arrayElements}
// 						WHERE id='${args.id}' AND arr.position=Cast((
// 								SELECT arr.position
// 								FROM ${args.table}, ${arrayElements}
// 								WHERE id='${args.id}' AND arr.item_object->>'${args.key}' = '${args.value}'
// 							) as int)`;
//       break;
//     case "remove":
//       query = `
//       UPDATE ${args.table} SET ${args.column} = ${args.column} -
//       Cast((
//       	SELECT position - 1
//       	FROM ${args.table}, ${arrayElements}
//       	WHERE id='${args.id}' and item_object->>'${args.key}' = '${args.value}') as int)
//       WHERE id='${args.id}' RETURNING "${args.column}"`;
//       break;
//     case "edit":
//       query = `
// 							WITH item AS (
// 											SELECT ('{${args.nested ? `${args.nested}` : ""}' || index - 1  || ',"${
//         args.key
//       }"}')::TEXT[] AS path, id
// 											FROM ${args.table},
// 																jsonb_array_elements(${args.column}) WITH ORDINALITY arr(item, index)
// 											WHERE item ->> '${args.lookup}' = '${args.old}'
// 							)
// 							UPDATE ${args.table}
// 							SET
// 								${args.column} = jsonb_set(${args.column}, item.path, '${JSON.stringify(
//         args.value
//       )}'::jsonb)
// 							FROM item
// 							WHERE ${args.table}.id = item.id RETURNING "${args.column}";
// 							`;
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
// 					WHERE id='${args.id}'`;
//       break;
//   }

//   query += ` RETURNING "${args.column}"`;
//   return await this.query<User | Guild | T>(query);
// },
