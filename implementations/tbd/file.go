//go:build jwx_es256k

package main

import (
	"encoding/json"
	"io/ioutil"
	"strings"

	"github.com/TBD54566975/did-sdk/cryptosuite"
	"github.com/TBD54566975/did-sdk/vc"
	"github.com/pkg/errors"
)

func getCredentialFromFile(filePath string) (*vc.VerifiableCredential, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read credential from file: %s", filePath)
	}
	var cred vc.VerifiableCredential
	if err := json.Unmarshal(bytes, &cred); err != nil {
		return nil, errors.Wrap(err, "could not unmarshal credential")
	}
	return &cred, nil
}

func getKeyFromFile(filePath string) (*cryptosuite.JSONWebKey2020, error) {
	bytes, err := ioutil.ReadFile(filePath)
	if err != nil {
		return nil, errors.Wrapf(err, "could not read key from file: %s", filePath)
	}
	var key cryptosuite.JSONWebKey2020
	if err := json.Unmarshal(bytes, &key); err != nil {
		return nil, errors.Wrap(err, "could not unmarshal key")
	}
	return &key, nil
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
