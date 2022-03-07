const baseUrl = window.location.origin.includes("localhost")
  ? window.location.origin
  : "https://identity.foundation/JWS-Test-Suite";

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

const impContainer = "implementations";

const pass = "✅ pass";
const fail = "❌ fail";

const buildLinkToVector = (fileName) => {
  if (fileName.includes("credential")) {
    return `<a href="${baseUrl}/credentials/${fileName}.json">${fileName}</a>`;
  }

  if (fileName.includes("presentation")) {
    return `<a href="${baseUrl}/presentations/${fileName}.json">${fileName}</a>`;
  }
};

const buildLinkToKey = (keyName, keyLabel) => {
  return `<a href="${baseUrl}/keys/${keyName}">${keyLabel}</a>`;
};

const buildLinkToImplementationResultForVector = (
  implementation,
  vector,
  result
) => {
  return `<a href="${baseUrl}/implementations/${implementation}/${vector}">${result}</a>`;
};

const buildLinkToImplementation = (imp, label) => {
  return `<a href="https://github.com/decentralized-identity/JWS-Test-Suite/tree/main/implementations/${imp.name}">${label}</a>`;
};

const addTable = (name, data, impName) => {
  if (!data) {
    return "";
  }
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
    <td>
    ${row.rsa2048 || ""}
    </td>
  </tr>`;
    });

  return `
  <section>
  <h4 id="${impName}-${name.replace(" ", "-").toLowerCase()}">${name}</h4>
  <table class="simple" style="width: 100%;">
  <thead>
  <tr>
    <th>Vector</th>
    <th>${buildLinkToKey("key-0-ed25519.json", "Ed25519")}</th>
    <th>${buildLinkToKey("key-1-secp256k1.json", "Secp256k1")}</th>
    <th>${buildLinkToKey("key-2-secp256r1.json", "Secp256r1")}</th>
    <th>${buildLinkToKey("key-3-secp384r1.json", "Secp384r1")}</th>
    <th>${buildLinkToKey("key-4-rsa2048.json", "RSA (2048-bit)")}</th>
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
    const key = v.split(".")[0].split("-").pop();
    let type, format;

    if (v.includes("credential")) {
      type = "vc";
      format = v.includes("jwt") ? "vc-jwt" : "vc";
    }

    if (!v.includes("credential")) {
      type = "vp";
      format = v.includes("jwt") ? "vp-jwt" : "vp";
    }

    let result = imp.vectors[v].verification.verified ? pass : fail;

    result = buildLinkToImplementationResultForVector(imp.name, v, result);
    vectorTables[format] = vectorTables[format] || {};
    vectorTables[format][name] = vectorTables[format][name] || {};
    vectorTables[format][name] = {
      ...vectorTables[format][name],
      [key]: result,
    };
  });

  if (Object.keys(vectorTables).length) {
    console.log(vectorTables);
    const section = `
    <section>
  
    <h3>${imp.name}</h3>
  
    <p>
    ${buildLinkToImplementation(imp, "🔍 View source.")}
    </p>
  
    ${addTable("Credentials", vectorTables.vc, imp.name)}

    ${addTable("Credentials JWT", vectorTables["vc-jwt"], imp.name)}
  

    ${addTable("Presentations", vectorTables.vp, imp.name)}

    ${addTable("Presentations JWT", vectorTables["vp-jwt"], imp.name)}
  
    </section>
    `;

    document
      .getElementById(impContainer)
      .insertAdjacentHTML("beforeend", section);
  }
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
