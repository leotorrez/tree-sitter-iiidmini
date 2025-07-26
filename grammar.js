/**
 * @file 3DM Parser
 * @author Leandro Torrez <leotorrez@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

module.exports = grammar({
  name: "iiidm",

  rules: {
    source_file: ($) => repeat($._section),

    _section: ($) =>
      choice(
        $._regular_section,
        //     $._named_section,
        // ),
        // _named_section: $ => choice(
        //   $.shader_override,
        //   $.shader_regex,
        //   $.texture_override,
        //   $.custom_shader,
        //   $.command_list,
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
      seq(
        "[",
        field("name", "Present"),
        "]",
        field("body", repeat($._expression)),
      ),

    _expression: ($) =>
      choice(
        $.key_value_pair,
        // $.commandlist,
      ),
    key_value_pair: ($) => seq($._key, "=", $._value),

    variable: ($) => seq("$", $.identifier),

    _key: ($) => choice($.variable),

    _value: ($) => choice($.number),

    identifier: ($) => /[a-zA-Z_][a-zA-Z0-9_]*/,

    number: ($) => /[\d\.]+/,
  },
});
