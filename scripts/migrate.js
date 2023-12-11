const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

const argv = yargs
  .command("up", "Create tables", {
    filename: {
      describe: "Specify migration file name",
      demandOption: false,
      type: "string",
    },
  })
  .command("down", "Drop tables", {
    filename: {
      describe: "Specify migration file name",
      demandOption: false,
      type: "string",
    },
  })
  .command("refresh", "Re-create tables", {
    filename: {
      describe: "Specify migration file name",
      demandOption: false,
      type: "string",
    },
  })
  .help().argv;

const { _ } = argv;
const command = _[0];
const migrationFileName = argv?.filename;

const executeMigrations = async (migrateCommand) => {
  try {
    const migrationDirectory = path.join(__dirname, "../migrations");
    const migrationFiles = fs.readdirSync(migrationDirectory);

    if (migrationFileName) {
      const migration = require(path.join(
        migrationDirectory,
        migrationFileName
      ));
      await migration[migrateCommand]();
    } else {
      for (const file of migrationFiles) {
        const migration = require(path.join(migrationDirectory, file));
        await migration[migrateCommand]();
      }
    }
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(`Error: Migration file "${migrationFileName}" not found.`);
    } else {
      console.error(error);
    }

    setTimeout(() => {
      process.exit(1);
    }, 1000);
  } finally {
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  }
};

if (command === "up") {
  executeMigrations("up");
} else if (command === "down") {
  executeMigrations("down");
} else if (command === "refresh") {
  executeMigrations("down");
  executeMigrations("up");
} else {
  console.error("Invalid command");
  yargs.showHelp();
  process.exit(1);
}
