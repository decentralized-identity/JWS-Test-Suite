var loadIndex = () => {
  function loadJSON(path, success, error) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (success) success(JSON.parse(xhr.responseText));
        } else {
          if (error) error(xhr);
        }
      }
    };
    xhr.open("GET", path, true);
    xhr.send();
  }

  return new Promise((resolve, reject) => {
    loadJSON(
      "./implementations/index.json",
      function (data) {
        resolve(data);
      },
      function (xhr) {
        reject(xhr);
      }
    );
  });
};

const impContainer = "content-from-evaluation-index";

const pass = "✅ pass";
const fail = "❌ fail";

const buildLinkToVector = (fileName) => {
  if (fileName.includes("credential")) {
    return `<a href="/credentials/${fileName}.json">${fileName}</a>`;
  }

  if (fileName.includes("presentation")) {
    return `<a href="/presentations/${fileName}.json">${fileName}</a>`;
  }
};

const buildLinkToKey = (keyName, keyLabel) => {
  return `<a href="/keys/${keyName}">${keyLabel}</a>`;
};

const buildLinkToImplementationResultForVector = (
  implementation,
  vector,
  result
) => {
  return `<a href="/implementations/${implementation}/${vector}">${result}</a>`;
};

const buildLinkToImplementation = (imp, label) => {
  return `<a href="https://github.com/decentralized-identity/JWS-Test-Suite/tree/main/implementations/${imp.name}">${label}</a>`;
};

const addTable = (name, data) => {
  const rows = Object.keys(data)
    .map((vectorName) => {
      return { name: vectorName, ...data[vectorName] };
    })
    .map((row) => {
      return `<tr>
    <td>
    ${buildLinkToVector(row.name)}
    </td>
    <td>
    ${row.ed25519 || ""}
    </td>
    <td>
    ${row.secp256k1 || ""}
    </td>
    <td>
    ${row.secp256r1 || ""}
    </td>
    <td>
    ${row.secp384r1 || ""}
    </td>
  </tr>`;
    });

  return `
  <section>
  <h4>${name}</h4>
  <table class="simple" style="width: 100%;">
  <thead>
  <tr>
    <th>Vector</th>
    <th>${buildLinkToKey("key-0-ed25519.json", "Ed25519")}</th>
    <th>${buildLinkToKey("key-1-secp256k1.json", "Secp256k1")}</th>
    <th>${buildLinkToKey("key-2-secp256r1.json", "Secp256r1")}</th>
    <th>${buildLinkToKey("key-3-secp384r1.json", "Secp384r1")}</th>
  </tr>
  </thead>
  <tbody>
  ${rows.join("")}
  </tbody>
</table>

</section>

`;
};

const addImplementation = (imp) => {
  const vectors = Object.keys(imp.vectors);
  const vectorTables = {};
  vectors.map((v) => {
    const name = v.split("--")[0].split(".json")[0];
    const key = v.split("-").pop().split(".json")[0];
    const type = v.includes("credential") ? "vc" : "vp";
    let result = imp.vectors[v].verification.verified ? pass : fail;

    result = buildLinkToImplementationResultForVector(imp.name, v, result);
    vectorTables[type] = vectorTables[type] || {};
    vectorTables[type][name] = vectorTables[type][name] || {};
    vectorTables[type][name] = {
      ...vectorTables[type][name],
      [key]: result,
    };
  });

  const section = `
  <section>

  <h3>${imp.name}</h3>

  <p>
  ${buildLinkToImplementation(imp, "🔍 View source.")}
  </p>

  ${addTable("Credentials", vectorTables.vc)}

  ${addTable("Presentations", vectorTables.vp)}

  </section>
  `;

  document
    .getElementById(impContainer)
    .insertAdjacentHTML("beforeend", section);
};

var generateImplementations = async () => {
  const index = await loadIndex();
  for (let name of Object.keys(index)) {
    addImplementation({
      name,
      vectors: index[name],
    });
  }
};
