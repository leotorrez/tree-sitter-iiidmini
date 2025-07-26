package tree_sitter_iiidmini_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_iiidmini "http://github.com/leotorrez/tree-sitter-iiidmini/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_iiidmini.Language())
	if language == nil {
		t.Errorf("Error loading 3DM Parser grammar")
	}
}
