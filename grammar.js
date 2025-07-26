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
      seq($.namespace_statement, optional($.condition_statement)),

    namespace_statement: ($) => seq("namespace", "=", $.identifier),

    condition_statement: ($) => seq("condition", "=", $.eval_value),

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
        // $.loader_section,
      ),

    present_section: ($) =>
      seq("[", field("name", "Present"), "]", newline, repeat($._expression)),

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

    integer: ($) =>
      choice(
        decimal_integer,
        // hexadecimal_integer,
        // octal_integer,
        // binary_integer,
      ),

    identifier: ($) => literal_string,

    comment: ($) =>
      choice(
        //TODO: it can not be inline comments. Tecnically the first case matches
        seq(";", literal_string, newline),

        seq(newline, ";", literal_string),
      ),

    hash_16: ($) => hash_16,
    hash_8: ($) => hash_8,
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
  return optional(seq(name, "=", field(name, value)));
}
