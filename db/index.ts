import { Database } from "bun:sqlite";
const db = new Database("mydb.sqlite", { create: true });
db.run(
  `CREATE TABLE IF NOT EXISTS commands (id INTEGER PRIMARY KEY, command TEXT, sender TEXT, executed BOOLEAN DEFAULT FALSE);
  CREATE TABLE IF NOT EXISTS blocks (id INTEGER PRIMARY KEY, x INTEGER, y INTEGER, z INTEGER, player TEXT, type TEXT)`
);

const insertCommand = db.prepare(
  "INSERT INTO commands (command, sender) VALUES ($command, $sender)"
);

export function insertCommands(commands: string[], sender: string): number {
  const cmds = commands.filter((command:string) => command.trim().length > 2);
  
  const insertMany = db.transaction((commands: string[]) => {
    for (const command of commands) {
      console.log("Inserting command", command);
      insertCommand.run({ $command: command, $sender: sender });
    }

    return commands.length;
  });

  return insertMany(cmds);
}

export function getCommands(): Array<[number, string]> {
  const commands = db.prepare("SELECT id, command FROM commands WHERE executed = FALSE").all();
  return Object.fromEntries(commands.map((row: any) => [row.id, row.command]));
}

export function updateCommand(idx: number, executed: boolean) {
  db.prepare("UPDATE commands SET executed = $executed WHERE id = $id").run({ $id: idx, $executed: executed });
}

const insertBlock = db.prepare(
  "INSERT INTO blocks (x, y, z, player, type) VALUES ($x, $y, $z, $player, $type)"
);

export function storeBlock(x: number, y: number, z: number, player: string, type: string) {
  insertBlock.run({ $x: x, $y: y, $z: z, $player: player, $type: type });
}