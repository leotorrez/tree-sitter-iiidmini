/**
 * @file 3DM Parser
 * @author Leandro Torrez <leotorrez@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check
// const { Charset } = require("regexp-util");
//
// const getInverseRegex = (charset) =>
//   new RegExp(`[^${charset.toString().slice(1, -1)}]`);

const newline = /\r?\n/;
const decimal_integer = /[+-]?(0|[1-9](_?[0-9])*)/;
const decimal_integer_in_float_exponent_part = /[+-]?[0-9](_?[0-9])*/; // allow leading zeros
const float_fractional_part = /[.][0-9](_?[0-9])*/;
const float_exponent_part = seq(/[eE]/, decimal_integer_in_float_exponent_part);
const hash_16 = /[a-zA-Z0-9]{16}/;
const hash_8 = /[a-zA-Z0-9]{8}/;
const literal_string = /[a-zA-Z]+/;

module.exports = grammar({
  name: "iiidm",
  extras: ($) => [$.comment, newline, /[\t ]/],

  rules: {
    source_file: ($) => seq(optional($.header_section), repeat($._section)),

    header_section: ($) =>
      choice($._header_section_namespaced, $._header_section_conditioned),

    _header_section_namespaced: ($) =>
      seq(
        seq("namespace", "=", field("namespace", $.string), newline),
        named_field("condition", $.eval_value),
      ),

    _header_section_conditioned: ($) =>
      seq(
        seq("condition", "=", field("condition", $.eval_value), newline),
        named_field("namespace", $.string),
      ),

    _section: ($) => choice($._regular_section, $._named_section),
    _named_section: ($) =>
      choice(
        $.shader_override,
        //   $.shader_regex,
        //   $.texture_override,
        //   $.custom_shader,
        //   $.commandlist_section,
        //   $.resource_section,
        //   $.include_section,
        //   $.preset_section,
        //   $.key,
        //   $.named_include_section,
      ),
    _regular_section: ($) =>
      choice(
        $.present_section,
        // $.constants_section,
        // $.logging_section,
        // $.system_section,
        // $.device_section,
        // $.stereo_section,
        // $.rendering_section,
        // $.hunting_section,
        // $.profile_section,
        // $.convergence_map_section,
        // $.unnamed_include_section,
        // $.loader_section,
      ),

    loader_section: ($) =>
      seq(
        section_name("Loader"),
        named_field("loader", $.string),
        named_field("target", $.string),
        named_field("module", $.path),
        named_field("check_version", $.boolean),
        named_field("require_admin", $.boolean),
        named_field("entry_point", $.string),
        named_field("hook_proc", $.integer),
        named_field("launch", $.path),
        named_field("wait_for_target", $.boolean),
        named_field("delay", $.integer),
      ),

    present_section: ($) => seq(section_name("Present"), repeat($._expression)),

    shader_override: ($) =>
      seq(
        "[",
        "ShaderOverride",
        field("name", $.identifier),
        "]",
        newline,
        named_field("hash", $.hash_16),
        named_field("allow_duplicate_hash", $.allow_duplicate_hash_value),
        field("body", repeat($._expression)),
      ),

    allow_duplicate_hash_value: ($) => choice("overrule", "true", "false"),

    expression: ($) => $._expression,
    // TODO: add expressions logic here
    _expression: ($) =>
      choice(
        // $.key_value_pair,
        $.assignment,
        $.commandlist,
      ),

    assignment: ($) =>
      seq(
        optional($.scope_prefix),
        optional($.timing_prefix),
        $._key,
        "=",
        $._value,
      ),
    variable: ($) => seq("$", field("name", $.identifier)),
    _key: ($) => choice($.variable),
    _value: ($) => choice($.float),
    eval_value: ($) => $._value,

    timing_prefix: ($) => choice("post", "pre"),
    scope_prefix: ($) => choice("local", "global"),

    commandlist: ($) => seq($.commandlist_rarg, "=", $.commandlist_rarg),
    commandlist_larg: ($) => literal_string,
    commandlist_rarg: ($) => literal_string,

    identifier: ($) => literal_string,

    // if_statement: ($) =>
    //   seq(
    //     "if",
    //     field("condition", $.expression),
    //     newline,
    //     field("consequence", $._suite),
    //     repeat(field("alternative", $.elif_clause)),
    //     optional(field("alternative", $.else_clause)),
    //   ),
    //
    // elif_clause: ($) =>
    //   seq(
    //     "elif",
    //     field("condition", $.expression),
    //     newline,
    //     field("consequence", $._suite),
    //   ),
    //
    //
    // else_clause: ($) => seq("else", newline, field("body", $._suite)),
    //
    // endif_statement: ($) => seq("endif", newline),

    comment: ($) =>
      choice(
        //TODO: it can not be inline comments. Tecnically the first case matches
        seq(";", literal_string, newline),
        seq(newline, ";", literal_string),
      ),

    hash_16: ($) => hash_16,
    hash_8: ($) => hash_8,
    string: ($) => literal_string,
    path: ($) => literal_string,
    boolean: ($) => /^(true|false|0|1)$/,
    integer: ($) =>
      choice(
        decimal_integer,
        // hexadecimal_integer,
        // octal_integer,
        // binary_integer,
      ),

    float: ($) =>
      choice(
        token(
          seq(
            decimal_integer,
            choice(
              float_fractional_part,
              seq(optional(float_fractional_part), float_exponent_part),
            ),
          ),
        ),
        /[+-]?(inf|nan)/,
      ),
    // _literal_string: $ =>
    //   seq(
    //     "'",
    //     optional(
    //       token.immediate(
    //         repeat1(getInverseRegex(control_chars.union("'").subtract("\t"))),
    //       ),
    //     ),
    //     token.immediate("'"),
    //   ),
  },
});

/**
 * Creates a rule that follows name = value matching while also defining a field by that name.
 *
 * @param {String} name
 *
 * @param {RuleOrLiteral} value
 *
 * @returns {ChoiceRule}
 */
function named_field(name, value) {
  return optional(seq(name, "=", field(name, value), newline));
}
/**
 * Creates a case insensitive section name rule.
 *
 * @param {String} name
 *
 * @returns {TokenRule}
 */
function section_name(name) {
  return token(seq("[", field("name", name), "]", newline));
}
