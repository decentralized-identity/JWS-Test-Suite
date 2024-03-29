package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

const (
	// Supported input types

	CredentialInputType        string = "credential"
	VerifiablePresentationType string = "presentation"

	// Supported formats

	VerifiableCredentialFormat    = "vc"
	VerifiableCredentialJWTFormat = "vc-jwt"

	VerifiablePresentationFormat    = "vp"
	VerifiablePresentationJWTFormat = "vp-jwt"
)

func main() {
	if len(os.Args) < 3 {
		panic("must supply input type arguments")
	}

	inputType := os.Args[1]
	if !isSupportedInputType(inputType) {
		fmt.Printf("unsupported input type: %s\n", inputType)
		os.Exit(1)
	}

	var input, output, key, format string

	createCmd := flag.NewFlagSet("create", flag.ExitOnError)
	createCmd.StringVar(&input, "input", "", "input file")
	createCmd.StringVar(&output, "output", "", "output file")
	createCmd.StringVar(&key, "key", "", "key file for request")
	createCmd.StringVar(&format, "format", "", "format of output")

	verifyCmd := flag.NewFlagSet("verify", flag.ExitOnError)
	verifyCmd.StringVar(&input, "input", "", "input file")
	verifyCmd.StringVar(&output, "output", "", "output file")
	verifyCmd.StringVar(&format, "format", "", "format of output")

	switch os.Args[2] {
	case "create":
		if err := createCmd.Parse(os.Args[3:]); err != nil {
			fmt.Printf("error running create: %s\n", err.Error())
			os.Exit(1)
		}
		validateCreateFlags(input, output, key, format)
		var err error
		if inputType == CredentialInputType {
			err = CreateCredential(input, key, output, format)
		} else {
			err = CreatePresentation(input, key, output, format)
		}
		if err != nil {
			fmt.Printf("error creating %s: %s\n", inputType, err.Error())
			os.Exit(1)
		}
	case "verify":
		if err := createCmd.Parse(os.Args[3:]); err != nil {
			fmt.Printf("error running verify: %s\n", err.Error())
			os.Exit(1)
		}
		validateVerifyFlags(input, output, format)
		keyPath := buildKeyPath(input)

		var err error
		if inputType == CredentialInputType {
			if format == "" {
				format = VerifiableCredentialFormat
				if isJWTFile(input) {
					format = VerifiableCredentialJWTFormat
				}
			}
			err = VerifyCredential(input, keyPath, output, format)
		} else {
			if format == "" {
				format = VerifiablePresentationFormat
				if isJWTFile(input) {
					format = VerifiablePresentationJWTFormat
				}
			}
			err = VerifyPresentation(input, keyPath, output, format)
		}
		if err != nil {
			fmt.Printf("error verifying %s: %s\n", inputType, err.Error())
			os.Exit(1)
		}
	default:
		fmt.Println("expected 'create' or 'verify' command")
		os.Exit(1)
	}
}

func validateCreateFlags(input, output, key, format string) {
	validateInputAndOutputFlags(input, output, format)
	if key == "" {
		fmt.Println("no key specified")
		os.Exit(1)
	}
	if format == "" {
		fmt.Println("no format specified")
		os.Exit(1)
	}
	if !isSupportedFormat(format) {
		fmt.Printf("unsupported format: %s\n", format)
		os.Exit(1)
	}
}

func validateVerifyFlags(input, output, format string) {
	validateInputAndOutputFlags(input, output, format)
}

func validateInputAndOutputFlags(input, output, format string) {
	if input == "" {
		fmt.Println("no input file specified")
		os.Exit(1)
	}
	if output == "" {
		fmt.Println("no output file specified")
		os.Exit(1)
	}
	if format == "" {
		fmt.Println("no format specified...will try to infer")
	}
}

func isSupportedInputType(inputType string) bool {
	return inputType == CredentialInputType || inputType == VerifiablePresentationType
}

func isSupportedFormat(format string) bool {
	return format == VerifiableCredentialFormat || format == VerifiablePresentationFormat ||
		format == VerifiableCredentialJWTFormat || format == VerifiablePresentationJWTFormat
}

func isJWTFile(filePath string) bool {
	return strings.Contains(filePath, "jwt")
}
