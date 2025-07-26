import XCTest
import SwiftTreeSitter
import TreeSitterIiidmini

final class TreeSitterIiidminiTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_iiidmini())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading 3DM Parser grammar")
    }
}
