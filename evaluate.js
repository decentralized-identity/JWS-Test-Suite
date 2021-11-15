console.log("\n🔎 Preparing evaluation report...\n");

const path = require("path");
const fs = require("fs");
const { verify } = require("./implementations/transmute/cli");
const implementationsReport = path.join(__dirname, "./data/implementations");

const buildImplementationsIndex = () => {
  const implementationIndex = {};
  const imps = fs.readdirSync(implementationsReport);
  imps.forEach((imp) => {
    if (imp.includes("index.json")) {
      return;
    }
    const implementationVectorsPath = path.join(
      __dirname,
      "./data/implementations/",
      imp
    );
    const implementationVectors = fs.readdirSync(implementationVectorsPath);
    implementationIndex[imp] = {};
    implementationVectors.forEach(async (v) => {
      if (!v.endsWith(".json")) {
        return;
      }
      if (v.includes("test.json")) {
        return;
      }

      if (v.includes("test.verification.json")) {
        return;
      }
      const vectorPath = path.resolve(
        __dirname,
        "./data/implementations/",
        imp,
        v
      );
      const vectorFile = fs.readFileSync(vectorPath).toString();
      try {
        const parsedVector = JSON.parse(vectorFile);
        implementationIndex[imp] = {
          ...implementationIndex[imp],
          [v]: parsedVector,
        };
      } catch (e) {
        console.warn("Unable to parse: " + vectorPath);
      }
    });
  });

  return implementationIndex;
};

const extendIndexWithEvaluations = async (index) => {
  const implementations = Object.keys(index);
  for (const implementation of implementations) {
    const vectors = Object.keys(index[implementation]);
    for (const vector of vectors) {
      let format;
      let vectorContent;
      if (vector.includes("credential")) {
        format = vector.includes("vc-jwt") ? "vc-jwt" : "vc";
        if (!format.includes("jwt")) {
          vectorContent = index[implementation][vector];
        } else {
          vectorContent = index[implementation][vector].jwt;
        }
      } else {
        format = vector.includes("vp-jwt") ? "vp-jwt" : "vp";
        if (!format.includes("jwt")) {
          vectorContent = index[implementation][vector];
        } else {
          vectorContent = index[implementation][vector].jwt;
        }
      }

      const verification = await verify(vectorContent, format);

      index[implementation][vector] = {
        vector: format,
        vectorContent,
        verification,
      };
    }
  }
  return index;
};

(async () => {
  const implementationIndex = buildImplementationsIndex();

  const implementationResults = await extendIndexWithEvaluations(
    implementationIndex
  );

  const indexOutputPath = path.join(
    __dirname,
    "./data/implementations/index.json"
  );

  fs.writeFileSync(
    indexOutputPath,
    JSON.stringify(implementationResults, null, 2)
  );
})().catch((e) => {
  console.error(e)
  process.exit(1)
});
