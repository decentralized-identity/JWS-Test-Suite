use async_trait::async_trait;
use atty::Stream;
use serde::{Deserialize, Serialize};
use ssi::jwk::JWK;
use ssi::ldp::{JsonWebSignature2020, ProofSuite};
use ssi::vc::{Credential, LinkedDataProofOptions, Presentation, ProofPurpose, VerificationResult};
use std::fmt;
use std::fs::File;
use std::io::{stdin, stdout, BufReader, BufWriter, Read, Write};
use std::path::PathBuf;
use std::str::FromStr;
use structopt::StructOpt;
use thiserror::Error;

use ssi::did::{
    Context, Contexts, DIDMethod, Document, VerificationMethod, VerificationMethodMap,
    DEFAULT_CONTEXT, DIDURL,
};

use ssi::did_resolve::{
    DIDResolver, DocumentMetadata, ResolutionInputMetadata, ResolutionMetadata, ERROR_NOT_FOUND,
};

fn file_or_stdin(path_buf_opt: Option<PathBuf>) -> Result<Box<dyn Read>, std::io::Error> {
    if let Some(path_buf) = path_buf_opt {
        return Ok(Box::new(File::open(path_buf)?));
    }
    if atty::is(Stream::Stdin) {
        eprintln!("TTY detected. Enter input data and then press Control-D.");
    }
    Ok(Box::new(stdin()))
}

fn file_or_stdout(path_buf_opt: Option<PathBuf>) -> Result<Box<dyn Write>, std::io::Error> {
    match path_buf_opt {
        Some(path_buf) => Ok(Box::new(File::create(path_buf)?)),
        None => Ok(Box::new(stdout())),
    }
}

#[derive(Debug)]
pub enum Format {
    VP,
    VpJwt,
    VC,
    VcJwt,
}

impl FromStr for Format {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "vp" => Ok(Self::VP),
            "vp-jwt" => Ok(Self::VpJwt),
            "vc" => Ok(Self::VC),
            "vc-jwt" => Ok(Self::VcJwt),
            _ => Err(format!("Unknown format: {}", s)),
        }
    }
}

impl fmt::Display for Format {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            Self::VP => write!(f, "vp"),
            Self::VpJwt => write!(f, "vp-jwt"),
            Self::VC => write!(f, "vc"),
            Self::VcJwt => write!(f, "vc-jwt"),
        }
    }
}

#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Key {
    pub id: String,
    #[serde(rename = "type")]
    pub type_: String,
    pub controller: String,
    #[serde(rename = "publicKeyJwk")]
    pub public_key_jwk: JWK,
    #[serde(rename = "privateKeyJwk")]
    pub private_key_jwk: JWK,
}

#[derive(StructOpt, Debug)]
pub enum VCSubcommand {
    Create {
        #[structopt(short, long, parse(from_os_str))]
        key: PathBuf,
        #[structopt(short, long, parse(from_os_str))]
        /// Input filename. If omitted, standard input is used.
        input: Option<PathBuf>,
        #[structopt(short, long, parse(from_os_str))]
        /// Output filename. If omitted, standard output is used.
        output: Option<PathBuf>,
        #[structopt(short, long)]
        format: Option<Format>,
    },
    Verify {
        #[structopt(short, long, parse(from_os_str))]
        /// Input filename. If omitted, standard input is used.
        input: Option<PathBuf>,
        #[structopt(short, long, parse(from_os_str))]
        /// Output filename. If omitted, standard output is used.
        output: Option<PathBuf>,
        #[structopt(short, long)]
        format: Option<Format>,
    },
}

#[derive(StructOpt, Debug)]
pub enum SSIJWS {
    Credential(VCSubcommand),
    Presentation(VCSubcommand),
}

#[derive(Deserialize, Serialize, Debug)]
pub struct JWT {
    jwt: String,
}

#[derive(Deserialize, Serialize, Debug)]
pub struct JWSTestSuiteVerificationResult {
    verified: bool,
    // Uncomment to pass through verification result.
    // #[serde(flatten)]
    // ssi_result: VerificationResult,
}

pub struct DIDExample;

impl From<VerificationResult> for JWSTestSuiteVerificationResult {
    fn from(res: VerificationResult) -> Self {
        Self {
            verified: res.errors.is_empty() && !res.checks.is_empty(),
            // ssi_result: res,
        }
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl DIDMethod for DIDExample {
    fn name(&self) -> &'static str {
        return "example";
    }

    fn to_resolver(&self) -> &dyn DIDResolver {
        self
    }
}

#[derive(Error, Debug)]
pub enum ReadKeyError {
    #[error("IO error: {0}")]
    IO(#[from] std::io::Error),
    #[error("Error parsing key: {0}")]
    KeyParse(serde_json::Error),
}

fn read_key(filename: &str) -> Result<Key, ReadKeyError> {
    let input_file = File::open(filename)?;
    let input_reader = BufReader::new(input_file);
    let key: Key = serde_json::from_reader(input_reader).map_err(ReadKeyError::KeyParse)?;
    Ok(key)
}

#[derive(Error, Debug)]
pub enum GenerateDIDDocumentError {
    #[error("Reading key: {0}")]
    ReadKey(#[from] ReadKeyError),
    #[error("Parsing DID URL: {0}")]
    DIDURLParse(ssi::error::Error),
}

fn generate_did_doc(did: &str) -> Result<Document, GenerateDIDDocumentError> {
    let key0 = read_key("data/keys/key-0-ed25519.json")?;
    let key1 = read_key("data/keys/key-1-secp256k1.json")?;
    let key2 = read_key("data/keys/key-2-secp256r1.json")?;
    let key3 = read_key("data/keys/key-3-secp384r1.json")?;
    let key4 = read_key("data/keys/key-4-rsa2048.json")?;
    let keys = [key0, key1, key2, key3, key4];
    let mut vm_urls = Vec::new();
    let mut vms = Vec::new();
    for key in keys {
        let vm_url = DIDURL::from_str(&key.id).map_err(GenerateDIDDocumentError::DIDURLParse)?;
        let vm = VerificationMethod::Map(VerificationMethodMap {
            id: key.id.to_string(),
            type_: key.type_.to_string(),
            controller: did.to_string(),
            public_key_jwk: Some(key.public_key_jwk.clone()),
            ..Default::default()
        });
        vms.push(vm);
        vm_urls.push(VerificationMethod::DIDURL(vm_url));
    }
    let doc = Document {
        context: Contexts::Many(vec![
            Context::URI(DEFAULT_CONTEXT.to_string()),
            Context::URI(ssi::jsonld::W3ID_JWS2020_V1_CONTEXT.to_string()),
        ]),
        id: did.to_string(),
        verification_method: Some(vms),
        assertion_method: Some(vm_urls.clone()),
        authentication: Some(vm_urls),
        ..Default::default()
    };
    Ok(doc)
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl DIDResolver for DIDExample {
    async fn resolve(
        &self,
        did: &str,
        _input_metadata: &ResolutionInputMetadata,
    ) -> (
        ResolutionMetadata,
        Option<Document>,
        Option<DocumentMetadata>,
    ) {
        match did {
            "did:example:123" => {
                let doc: Document = match generate_did_doc(did) {
                    Ok(doc) => doc,
                    Err(e) => {
                        return (
                            ResolutionMetadata::from_error(&format!(
                                "Unable to generate DID document: {}",
                                e
                            )),
                            None,
                            None,
                        );
                    }
                };
                (
                    ResolutionMetadata::default(),
                    Some(doc),
                    Some(DocumentMetadata::default()),
                )
            }
            _ => return (ResolutionMetadata::from_error(ERROR_NOT_FOUND), None, None),
        }
    }
}

#[tokio::main]
async fn main() -> Result<(), std::io::Error> {
    let opt = SSIJWS::from_args();
    match opt {
        SSIJWS::Credential(VCSubcommand::Create {
            key,
            input,
            output,
            format,
        }) => {
            let jwt = match format.unwrap_or(Format::VC) {
                Format::VC => false,
                Format::VcJwt => true,
                f => panic!("Unexpected format {} for credential create", f),
            };
            let key_file = File::open(key)?;
            let key_reader = BufReader::new(key_file);
            let key: Key = serde_json::from_reader(key_reader)?;

            let input_file = file_or_stdin(input)?;
            let input_reader = BufReader::new(input_file);
            let mut credential: Credential = serde_json::from_reader(input_reader)?;

            let private_key_jwk = key.private_key_jwk.clone();
            let mut options = LinkedDataProofOptions {
                verification_method: Some(ssi::vc::URI::String(key.id.to_string())),
                proof_purpose: Some(ProofPurpose::AssertionMethod),
                checks: None,
                ..Default::default()
            };
            let resolver = DIDExample;
            let output_file = file_or_stdout(output)?;
            let output_writer = BufWriter::new(output_file);
            if jwt {
                options.created = None;
                let jwt = credential
                    .generate_jwt(Some(&private_key_jwk), &options, &resolver)
                    .await
                    .unwrap();
                let jwt_obj = JWT { jwt };
                serde_json::to_writer_pretty(output_writer, &jwt_obj)?;
            } else {
                let proof = JsonWebSignature2020
                    .sign(&credential, &options, &resolver, &private_key_jwk, None)
                    .await
                    .unwrap();
                credential.add_proof(proof);
                let vc = credential;
                serde_json::to_writer_pretty(output_writer, &vc)?;
            }
        }
        SSIJWS::Credential(VCSubcommand::Verify {
            input,
            output,
            format,
        }) => {
            let jwt = match format.unwrap_or(Format::VC) {
                Format::VC => false,
                Format::VcJwt => true,
                f => panic!("Unexpected format {} for credential verify", f),
            };
            let input_file = file_or_stdin(input)?;
            let input_reader = BufReader::new(input_file);
            let resolver = DIDExample;
            let result = if jwt {
                let jwt: JWT = serde_json::from_reader(input_reader)?;
                Credential::verify_jwt(&jwt.jwt, None, &resolver).await
            } else {
                let vc: Credential = serde_json::from_reader(input_reader)?;
                vc.verify(None, &resolver).await
            };
            let output_file = file_or_stdout(output)?;
            let output_writer = BufWriter::new(output_file);
            let result = JWSTestSuiteVerificationResult::from(result);
            serde_json::to_writer_pretty(output_writer, &result)?;
        }
        SSIJWS::Presentation(VCSubcommand::Create {
            key,
            input,
            output,
            format,
        }) => {
            let jwt = match format.unwrap_or(Format::VP) {
                Format::VP => false,
                Format::VpJwt => true,
                f => panic!("Unexpected format {} for presentation create", f),
            };
            let key_file = File::open(key)?;
            let key_reader = BufReader::new(key_file);
            let key: Key = serde_json::from_reader(key_reader)?;

            let input_file = file_or_stdin(input)?;
            let input_reader = BufReader::new(input_file);
            let mut presentation: Presentation = serde_json::from_reader(input_reader)?;
            if let Some(existing_holder) = presentation.holder {
                if existing_holder.to_string() != key.controller {
                    panic!("Presentation already has different holder");
                }
            }
            presentation.holder = Some(ssi::vc::URI::String(key.controller.to_string()));

            let private_key_jwk = key.private_key_jwk.clone();
            let mut options = LinkedDataProofOptions {
                verification_method: Some(ssi::vc::URI::String(key.id.to_string())),
                proof_purpose: Some(ProofPurpose::Authentication),
                challenge: Some("123".to_string()),
                checks: None,
                ..Default::default()
            };
            let resolver = DIDExample;
            let output_file = file_or_stdout(output)?;
            let output_writer = BufWriter::new(output_file);
            if jwt {
                options.created = None;
                let jwt = presentation
                    .generate_jwt(Some(&private_key_jwk), &options, &resolver)
                    .await
                    .unwrap();
                let jwt_obj = JWT { jwt };
                serde_json::to_writer_pretty(output_writer, &jwt_obj)?;
            } else {
                let proof = JsonWebSignature2020
                    .sign(&presentation, &options, &resolver, &private_key_jwk, None)
                    .await
                    .unwrap();
                presentation.add_proof(proof);
                let vp = presentation;
                serde_json::to_writer_pretty(output_writer, &vp)?;
            }
        }
        SSIJWS::Presentation(VCSubcommand::Verify {
            input,
            output,
            format,
        }) => {
            let jwt = match format.unwrap_or(Format::VP) {
                Format::VP => false,
                Format::VpJwt => true,
                f => panic!("Unexpected format {} for presentation create", f),
            };
            let input_file = file_or_stdin(input)?;
            let input_reader = BufReader::new(input_file);
            let resolver = DIDExample;
            let result = if jwt {
                let jwt: JWT = serde_json::from_reader(input_reader)?;
                Presentation::verify_jwt(&jwt.jwt, None, &resolver).await
            } else {
                let vp: Presentation = serde_json::from_reader(input_reader)?;
                vp.verify(None, &resolver).await
            };
            let result = JWSTestSuiteVerificationResult::from(result);
            let output_file = file_or_stdout(output)?;
            let output_writer = BufWriter::new(output_file);
            serde_json::to_writer_pretty(output_writer, &result)?;
        }
    }
    Ok(())
}
