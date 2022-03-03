const { createVerifiableCredentialJwt, createVerifiablePresentationJwt, verifyCredential, verifyPresentation } = require("did-jwt-vc")
const moment = require("moment")
const { EdDSASigner, ES256KSigner, EllipticSigner } = require("did-jwt")
const base64url = require("base64url");

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = require("base-x")(BASE58);

function privateKeyJwkToPrivateKeyBase58(buffer) {
  const privateKeyBase58 = bs58.encode(buffer);
  return privateKeyBase58;
}

function buildIssuer(did, privateKeyJwk) {
  let theSigner = null
  let alg = null
 if (privateKeyJwk.kty === 'OKP' && privateKeyJwk.crv === 'Ed25519') {
    const buffer = Buffer.concat([
      base64url.toBuffer(privateKeyJwk.d),
      base64url.toBuffer(privateKeyJwk.x)
    ])
    const pk = privateKeyJwkToPrivateKeyBase58(buffer)
    theSigner = new EdDSASigner(pk)
    alg = 'EdDSA'
  } 
  /*
  if (privateKeyJwk.kty === 'EC') {
  const pk = keyto.from( JSON.stringify(privateKeyJwk), 'jwk').toString('blk', 'private')
  theSigner = new ES256KSigner(pk)
  if (privateKeyJwk.crv === 'secp256k1') {
    alg = 'ES256K'
  } else if (privateKeyJwk.crv === 'P-256') {
    alg = 'ES256'
  }
}
else if (privateKeyJwk.kty === 'RSA') {
    theSigner = new EllipticSigner(pk)
    alg = 'PS256'
  }
*/
  if (!theSigner) {
    return null;
  }
  
  return {
    did: did,
    signer: theSigner,
    alg: alg
  }
}

function toCredentialPayload(credential) {
  const payload = { vc: credential }
  if (credential.id) {
    payload.jti = credential.id
  }
  if (credential.issuanceDate) {
    payload.nbf = moment.utc(credential.issuanceDate).unix()
  }
  if (credential.expirationDate) {
    payload.exp = moment.utc(credential.expirationDate).unix()
  }
  if (credential.issuer) {
    payload.iss =
      typeof credential.issuer === "string"
        ? credential.issuer
        : credential.issuer.id
  }
  if (credential.credentialSubject.id) {
    payload.sub = credential.credentialSubject.id
  }
  return payload
}

function toPresentationPayload(presentation, identifier) {

  const payload = {
    vp: presentation
  }

  payload.vp.holder = identifier
  payload.iss = identifier
  payload.sub = identifier
  payload.nonce = "123"
  return payload
}

function createOptions(kid) {
  const options = {};
  options.header = {};
  options.header.kid = kid;
  return options;
}


const createVcJwt = async (credential, key) => {
  const identifier = key.id.split("#")[0]
  const issuer = buildIssuer(identifier, key.privateKeyJwk)
  if (!issuer) return {}
  
  const payload = toCredentialPayload(credential)
  const options = createOptions(key.id);
  const vcJwt = await createVerifiableCredentialJwt(payload, issuer, options)
  return vcJwt;
}

const createVpJwt = async(presentation, key) => {
  const identifier = key.id.split("#")[0]
  const issuer = buildIssuer(identifier, key.privateKeyJwk)
  if (!issuer) return {}

  const vpPayload = toPresentationPayload(presentation, identifier)
  const options = createOptions(key.id);
  
  const vpJwt = await createVerifiablePresentationJwt(vpPayload, issuer, options)
  return vpJwt
}

const verifyVcJwt = async (credential, format) => {

  //const didResolver = new ExampleResolver()

  //const verifiedVC = await verifyCredential(credential, didResolver)
  return {}
}


module.exports = { createVcJwt, createVpJwt, verifyVcJwt };

