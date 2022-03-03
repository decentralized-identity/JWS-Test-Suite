const yargs = require("yargs");
const cli = require("./cli");
yargs.scriptName("✨");


yargs.command(
  "presentation [action]",
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
    },
    format: {
      alias: "f",
      description: "Output format",
      default: "vp",
    },
  },
  async (argv) => {
    if (argv.action === "create") {
      await cli.createVerifiablePresentation({
        input: argv.input,
        output: argv.output,
        format: argv.format,
        key: argv.key,
      });
    }
    if (argv.action === "verify") {
      await cli.verifyVerifiablePresentation({
        input: argv.input,
        output: argv.output,
        format: argv.format,
      });
    }
  }
);

yargs.command(
  "credential [action]",
  "verifiable credentials api",
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
    },
    format: {
      alias: "f",
      description: "Input format",
      default: "vc-jwt",
    },
  },
  async (argv) => {
    if (argv.action === "create") {
      await cli.createVerifiableCredential({
        input: argv.input,
        output: argv.output,
        format: argv.format,
        key: argv.key,
      });
    }
    if (argv.action === "verify") {
      await cli.verifyVerifiableCredential({
        input: argv.input,
        output: argv.output,
        format: argv.format,
      });
    }
  }
);

yargs.help().alias("help", "h").demandCommand().argv;
