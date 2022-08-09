package main

import (
	"encoding/json"
	"io/ioutil"
	"strings"

	"github.com/hyperledger/aries-framework-go/pkg/doc/verifiable"
	bddVerifiable "github.com/hyperledger/aries-framework-go/test/bdd/pkg/verifiable"

	"github.com/pkg/errors"
)

func getCredentialFromFile(filePath string) (*verifiable.Credential, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read credential from file: %s", filePath)
	}
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return nil, err
	}
	return verifiable.ParseCredential(bytes,
		verifiable.WithJSONLDDocumentLoader(documentLoader),
		verifiable.WithDisabledProofCheck())
}

func getPresentationFromFile(filePath string) (*verifiable.Presentation, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read presentation from file: %s", filePath)
	}
	documentLoader, err := bddVerifiable.CreateDocumentLoader()
	if err != nil {
		return nil, err
	}
	return verifiable.ParsePresentation(bytes,
		verifiable.WithPresJSONLDDocumentLoader(documentLoader),
		verifiable.WithPresDisabledProofCheck())
}

type JWTJSONFile struct {
	JWT string `json:"jwt"`
}

func getJWTFromFile(filePath string) (string, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return "", errors.Wrapf(err, "could not read jwt from file: %s", filePath)
	}
	var jwt JWTJSONFile
	if err := json.Unmarshal(bytes, &jwt); err != nil {
		return "", errors.Wrap(err, "could not unmarshal jwt")
	}
	return jwt.JWT, nil
}

func writeVerificationResult(result bool, filePath string) error {
	data, err := json.MarshalIndent(verificationResult{result}, "", "    ")
	if err != nil {
		return err
	}
	return writeOutputToFile(data, filePath)
}

type verificationResult struct {
	Verified bool `json:"verified"`
}

func writeOutputToFile(data []byte, filePath string) error {
	if err := ioutil.WriteFile(filePath, data, 0755); err != nil {
		return errors.Wrapf(err, "could not write %d bytes to file: %s", len(data), filePath)
	}
	return nil
}

// assume the standard key path and attempt to create a key path
func buildKeyPath(input string) string {
	keyIdx := strings.Index(input, "key")
	dotIdx := strings.Index(input, ".")
	fileIdx := strings.LastIndex(input, ".")
	path := "/data/keys/"
	key := input[keyIdx:dotIdx]
	file := input[fileIdx:]
	return strings.Join([]string{path, key, file}, "")
}
