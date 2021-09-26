const yargs = require("yargs");
const cli = require("./cli");
yargs.scriptName("✨");
yargs.command(
  "credential create",
  "Create a verifiable credential",
  {
    input: {
      alias: "i",
      description: "Path to input document",
      demandOption: true,
    },
    output: {
      alias: "o",
      description: "Path to output document",
      demandOption: true,
    },
    key: {
      alias: "k",
      description: "Path to key",
      demandOption: true,
    },
    format: {
      alias: "f",
      description: "Output format",
      default: "vc",
    },
  },
  async (argv) => {
    await cli.createVerifiableCredential({
      input: argv.input,
      output: argv.output,
      format: argv.format,
      key: argv.key,
    });
  }
);

yargs.command(
  "presentation create",
  "Create a verifiable presentation",
  {
    input: {
      alias: "i",
      description: "Path to input document",
      demandOption: true,
    },
    output: {
      alias: "o",
      description: "Path to output document",
      demandOption: true,
    },
    key: {
      alias: "k",
      description: "Path to key",
      demandOption: true,
    },
    format: {
      alias: "f",
      description: "Output format",
      default: "vp",
    },
  },
  async (argv) => {
    await cli.createVerifiablePresentation({
      input: argv.input,
      output: argv.output,
      format: argv.format,
      key: argv.key,
    });
  }
);

yargs.help().alias("help", "h").demandCommand().argv;
