use async_trait::async_trait;
use serde::Deserialize;
use ssi::jwk::JWK;
use ssi::ldp::{JsonWebSignature2020, ProofSuite};
use ssi::vc::{Credential, LinkedDataProofOptions, Presentation, ProofPurpose};
use std::fs::{File, OpenOptions};
use std::io::{BufReader, BufWriter};
use std::path::PathBuf;
use std::str::FromStr;
use structopt::StructOpt;

use ssi::did::{DIDMethod, Document};
use ssi::did_resolve::{
    DIDResolver, DocumentMetadata, ResolutionInputMetadata, ResolutionMetadata, ERROR_NOT_FOUND,
};

#[derive(Debug)]
pub enum Format {
    VP,
    VC,
}

impl FromStr for Format {
    type Err = String;
    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "vp" => Ok(Self::VP),
            "vc" => Ok(Self::VC),
            _ => Err(format!("Unknown format: {}", s)),
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
        input: PathBuf,
        #[structopt(short, long, parse(from_os_str))]
        output: PathBuf,
        format: Option<Format>,
    },
    Verify {
        #[structopt(short, long, parse(from_os_str))]
        input: PathBuf,
        #[structopt(short, long, parse(from_os_str))]
        output: PathBuf,
        format: Option<Format>,
    },
}

#[derive(StructOpt, Debug)]
pub enum SSIJWS {
    Credential(VCSubcommand),
    Presentation(VCSubcommand),
}

pub struct DIDExampleStatic;

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl DIDMethod for DIDExampleStatic {
    fn name(&self) -> &'static str {
        return "example";
    }

    fn to_resolver(&self) -> &dyn DIDResolver {
        self
    }
}

#[cfg_attr(target_arch = "wasm32", async_trait(?Send))]
#[cfg_attr(not(target_arch = "wasm32"), async_trait)]
impl DIDResolver for DIDExampleStatic {
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
                let doc: Document = match serde_json::from_str(include_str!("../did.json")) {
                    Ok(doc) => doc,
                    Err(e) => {
                        return (
                            ResolutionMetadata::from_error(&format!(
                                "Unable to parse DID document: {:?}",
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
            match format {
                Some(Format::VC) | None => {}
                Some(Format::VP) => panic!("Unexpected format VP for credential create"),
            }
            let key_file = File::open(key)?;
            let key_reader = BufReader::new(key_file);
            let key: Key = serde_json::from_reader(key_reader)?;

            let input_file = File::open(input)?;
            let input_reader = BufReader::new(input_file);
            let mut credential: Credential = serde_json::from_reader(input_reader)?;

            let private_key_jwk = key.private_key_jwk.clone();
            let options = LinkedDataProofOptions {
                verification_method: Some(ssi::vc::URI::String(key.id.to_string())),
                proof_purpose: Some(ProofPurpose::AssertionMethod),
                ..Default::default()
            };
            let resolver = DIDExampleStatic;
            let proof = JsonWebSignature2020
                .sign(&credential, &options, &resolver, &private_key_jwk, None)
                .await
                .unwrap();
            credential.add_proof(proof);
            let vc = credential;
            let output_file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(output)?;
            let output_writer = BufWriter::new(output_file);
            serde_json::to_writer_pretty(output_writer, &vc)?;
        }
        SSIJWS::Credential(VCSubcommand::Verify {
            input,
            output,
            format,
        }) => {
            match format {
                Some(Format::VC) | None => {}
                Some(Format::VP) => panic!("Unexpected format VP for credential verify"),
            }
            let input_file = File::open(input)?;
            let input_reader = BufReader::new(input_file);
            let vc: Credential = serde_json::from_reader(input_reader)?;
            let resolver = DIDExampleStatic;
            let result = vc.verify(None, &resolver).await;
            let output_file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(output)?;
            let output_writer = BufWriter::new(output_file);
            serde_json::to_writer_pretty(output_writer, &result)?;
        }
        SSIJWS::Presentation(VCSubcommand::Create {
            key,
            input,
            output,
            format,
        }) => {
            match format {
                Some(Format::VC) | None => {}
                Some(Format::VP) => panic!("Unexpected format VC for presentation create"),
            }
            let key_file = File::open(key)?;
            let key_reader = BufReader::new(key_file);
            let key: Key = serde_json::from_reader(key_reader)?;

            let input_file = File::open(input)?;
            let input_reader = BufReader::new(input_file);
            let mut presentation: Presentation = serde_json::from_reader(input_reader)?;

            let private_key_jwk = key.private_key_jwk.clone();
            let options = LinkedDataProofOptions {
                verification_method: Some(ssi::vc::URI::String(key.id.to_string())),
                proof_purpose: Some(ProofPurpose::Authentication),
                challenge: Some("123".to_string()),
                ..Default::default()
            };
            let resolver = DIDExampleStatic;
            let proof = JsonWebSignature2020
                .sign(&presentation, &options, &resolver, &private_key_jwk, None)
                .await
                .unwrap();
            presentation.add_proof(proof);
            let vp = presentation;
            let output_file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(output)?;
            let output_writer = BufWriter::new(output_file);
            serde_json::to_writer_pretty(output_writer, &vp)?;
        }
        SSIJWS::Presentation(VCSubcommand::Verify {
            input,
            output,
            format,
        }) => {
            match format {
                Some(Format::VP) | None => {}
                Some(Format::VC) => panic!("Unexpected format VC for presentation verify"),
            }
            let input_file = File::open(input)?;
            let input_reader = BufReader::new(input_file);
            let vp: Presentation = serde_json::from_reader(input_reader)?;
            let resolver = DIDExampleStatic;
            let result = vp.verify(None, &resolver).await;
            let output_file = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(output)?;
            let output_writer = BufWriter::new(output_file);
            serde_json::to_writer_pretty(output_writer, &result)?;
        }
    }
    Ok(())
}
