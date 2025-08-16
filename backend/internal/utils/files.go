package utils

import (
	"io/ioutil"
	"strings"
)

// ReadFile reads a file and returns trimmed content. Simple wrapper for error handling.
func ReadFile(path string) (string, error) {
	data, err := ioutil.ReadFile(path)
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(string(data)), nil
}