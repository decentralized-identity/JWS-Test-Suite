//go:build jwx_es256k

package main

import (
	"flag"
	"fmt"
	"os"
)

const (
	// Supported input types

	CredentialInputType string = "credential"

	// Supported formats

	VerifiableCredentialFormat = "vc"
)

func main() {
	if len(os.Args) < 3 {
		panic("must supply input type arguments")
	}

	inputType := os.Args[1]
	if !IsSupportedInputType(inputType) {
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

	switch os.Args[2] {
	case "create":
		if err := createCmd.Parse(os.Args[3:]); err != nil {
			fmt.Printf("error running create: %s\n", err.Error())
			os.Exit(1)
		}
		validateCreateFlags(input, output, key, format)
		if err := CreateCredential(input, key, output); err != nil {
			fmt.Printf("error creating credential: %s\n", err.Error())
			os.Exit(1)
		}
	case "verify":
		if err := createCmd.Parse(os.Args[3:]); err != nil {
			fmt.Printf("error running verify: %s\n", err.Error())
			os.Exit(1)
		}
		validateVerifyFlags(input, output)
		if err := VerifyCredential(input, key, output); err != nil {
			fmt.Printf("error verifying credential: %s\n", err.Error())
			os.Exit(1)
		}
	default:
		fmt.Println("expected 'create' or 'verify' command")
		os.Exit(1)
	}
}

func validateCreateFlags(input, output, key, format string) {
	validateInputAndOutputFlags(input, output)
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

func validateVerifyFlags(input, output string) {
	validateInputAndOutputFlags(input, output)
}

func validateInputAndOutputFlags(input, output string) {
	if input == "" {
		fmt.Println("no input file specified")
		os.Exit(1)
	}
	if output == "" {
		fmt.Println("no output file specified")
		os.Exit(1)
	}
}

func IsSupportedInputType(inputType string) bool {
	return inputType == CredentialInputType
}

func isSupportedFormat(format string) bool {
	return format == VerifiableCredentialFormat
}
