const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

yargs
  .option("filename", {
    describe: "Specify seeder file name",
    demandOption: false,
    type: "string",
  })
  .help().argv;

const seederFileName = yargs.argv?.filename;

const executeSeeder = async () => {
  try {
    const seederDirectory = path.join(__dirname, "../seeders");
    const seederFiles = fs.readdirSync(seederDirectory);

    if (seederFileName) {
      const seeder = require(path.join(seederDirectory, seederFileName));
      await seeder["seed"]();
    } else {
      for (const file of seederFiles) {
        const seeder = require(path.join(seederDirectory, file));
        await seeder["seed"]();
      }
    }
  } catch (error) {
    if (error.code === "MODULE_NOT_FOUND") {
      console.error(`Error: Seeder file "${seederFileName}" not found.`);
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

executeSeeder();
